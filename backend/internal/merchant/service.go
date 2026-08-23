package merchant

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/brudapay/brudapay/pkg/database"
	"github.com/brudapay/brudapay/pkg/models"
)

var (
	// ErrInsufficientInsurance возвращается, когда трейдер пытается работать
	// без внесённого страхового депозита.
	ErrInsufficientInsurance = errors.New("insufficient insurance deposit")
	ErrNoCasino              = errors.New("user is not linked to a merchant account")
	// ErrNotTrader возвращается, когда операция с реквизитами вызывается
	// аккаунтом типа "merchant" (мерчант даёт трафик и реквизитов не имеет).
	ErrNotTrader = errors.New("requisites are available only for trader accounts")
)


type Service struct {
	db *database.DB
}

func NewService(db *database.DB) *Service {
	return &Service{db: db}
}

// Profile — сведения о кабинете мерчанта/трейдера.
type Profile struct {
	CasinoID          uuid.UUID            `json:"casino_id"`
	Name              string               `json:"name"`
	APIKey            string               `json:"api_key"`
	Status            models.EntityStatus  `json:"status"`
	MerchantType      models.MerchantType  `json:"merchant_type"`
	InsuranceDeposit  float64              `json:"insurance_deposit"`
	InsuranceRequired float64              `json:"insurance_required"`
	IsActiveTrader    bool                 `json:"is_active_trader"`
}

// IsTrader сообщает, является ли аккаунт трейдером (принимает трафик,
// заводит реквизиты). Мерчант (даёт трафик) реквизитов не имеет.
func (p *Profile) IsTrader() bool {
	return p.MerchantType == models.MerchantTypeTrader
}


// Dashboard — агрегированные показатели кабинета.
type Dashboard struct {
	Profile          Profile `json:"profile"`
	Balance          float64 `json:"balance"`
	FrozenBalance    float64 `json:"frozen_balance"`
	Currency         string  `json:"currency"`
	Turnover         float64 `json:"turnover"`
	TransactionCount int64   `json:"transaction_count"`
	PaidCount        int64   `json:"paid_count"`
	ConversionRate   float64 `json:"conversion_rate"`
	ActiveRequisites int64   `json:"active_requisites"`
}

// CreateRequisiteRequest — данные реквизита, которые заводит сам трейдер.
type CreateRequisiteRequest struct {
	BankName      string  `json:"bank_name" binding:"required"`
	HolderName    string  `json:"holder_name" binding:"required"`
	AccountNumber string  `json:"account_number" binding:"required"`
	Currency      string  `json:"currency" binding:"required"`
	Country       string  `json:"country" binding:"required"`
	MinAmount     float64 `json:"min_amount"`
	MaxAmount     float64 `json:"max_amount"`
	DailyLimit    float64 `json:"daily_limit"`
}

func (s *Service) GetProfile(ctx context.Context, casinoID uuid.UUID) (*Profile, error) {
	var p Profile
	err := s.db.Pool.QueryRow(ctx, `
		SELECT id, name, api_key, status, COALESCE(merchant_type, 'merchant'),
		       insurance_deposit, insurance_required, is_active_trader
		FROM casinos WHERE id = $1
	`, casinoID).Scan(
		&p.CasinoID, &p.Name, &p.APIKey, &p.Status, &p.MerchantType,
		&p.InsuranceDeposit, &p.InsuranceRequired, &p.IsActiveTrader,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNoCasino
		}
		return nil, err
	}
	return &p, nil
}

func (s *Service) GetDashboard(ctx context.Context, casinoID uuid.UUID) (*Dashboard, error) {
	profile, err := s.GetProfile(ctx, casinoID)
	if err != nil {
		return nil, err
	}

	d := &Dashboard{Profile: *profile, Currency: "USD"}

	// Баланс мерчанта (может отсутствовать — тогда нули).
	_ = s.db.Pool.QueryRow(ctx, `
		SELECT balance, frozen_balance, currency
		FROM merchant_balances WHERE casino_id = $1
	`, casinoID).Scan(&d.Balance, &d.FrozenBalance, &d.Currency)

	// Оборот и конверсия по своим транзакциям.
	err = s.db.Pool.QueryRow(ctx, `
		SELECT
			COALESCE(SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END), 0),
			COUNT(*),
			COUNT(*) FILTER (WHERE status = 'PAID')
		FROM transactions WHERE casino_id = $1
	`, casinoID).Scan(&d.Turnover, &d.TransactionCount, &d.PaidCount)
	if err != nil {
		return nil, err
	}
	if d.TransactionCount > 0 {
		d.ConversionRate = float64(d.PaidCount) / float64(d.TransactionCount) * 100
	}

	_ = s.db.Pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM requisites WHERE casino_id = $1 AND status = 'ACTIVE'
	`, casinoID).Scan(&d.ActiveRequisites)

	return d, nil
}

// ListTransactions возвращает только транзакции текущего мерчанта.
func (s *Service) ListTransactions(ctx context.Context, casinoID uuid.UUID, limit, offset int) ([]models.Transaction, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	rows, err := s.db.Pool.Query(ctx, `
		SELECT id, external_id, casino_id, provider_id, requisite_id, amount, currency, country,
		       status, player_id, is_sandbox, processing_ms, created_at, updated_at, assigned_at, paid_at
		FROM transactions
		WHERE casino_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`, casinoID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.Transaction
	for rows.Next() {
		var t models.Transaction
		if err := rows.Scan(
			&t.ID, &t.ExternalID, &t.CasinoID, &t.ProviderID, &t.RequisiteID, &t.Amount, &t.Currency, &t.Country,
			&t.Status, &t.PlayerID, &t.IsSandbox, &t.ProcessingMs, &t.CreatedAt, &t.UpdatedAt, &t.AssignedAt, &t.PaidAt,
		); err != nil {
			return nil, err
		}
		list = append(list, t)
	}
	return list, rows.Err()
}

// ListRequisites возвращает реквизиты, заведённые самим трейдером.
func (s *Service) ListRequisites(ctx context.Context, casinoID uuid.UUID) ([]models.Requisite, error) {
	rows, err := s.db.Pool.Query(ctx, `
		SELECT id, COALESCE(provider_id, '00000000-0000-0000-0000-000000000000'::uuid), bank_name, holder_name,
		       account_number, currency, country, daily_limit, used_limit, status, is_sandbox, created_at, updated_at
		FROM requisites WHERE casino_id = $1 ORDER BY created_at DESC
	`, casinoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.Requisite
	for rows.Next() {
		var r models.Requisite
		if err := rows.Scan(
			&r.ID, &r.ProviderID, &r.BankName, &r.HolderName, &r.AccountNumber, &r.Currency,
			&r.Country, &r.DailyLimit, &r.UsedLimit, &r.Status, &r.IsSandbox, &r.CreatedAt, &r.UpdatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, r)
	}
	return list, rows.Err()
}

// CreateRequisite позволяет трейдеру самому добавить реквизит с лимитами и банком.
// Требуется активный страховой депозит.
func (s *Service) CreateRequisite(ctx context.Context, casinoID uuid.UUID, req CreateRequisiteRequest) (*models.Requisite, error) {
	profile, err := s.GetProfile(ctx, casinoID)
	if err != nil {
		return nil, err
	}
	if !profile.IsTrader() {
		return nil, ErrNotTrader
	}
	if !profile.IsActiveTrader {
		return nil, ErrInsufficientInsurance
	}


	var r models.Requisite
	err = s.db.Pool.QueryRow(ctx, `
		INSERT INTO requisites (casino_id, bank_name, holder_name, account_number, currency, country,
		                        daily_limit, min_amount, max_amount, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVE')
		RETURNING id, bank_name, holder_name, account_number, currency, country, daily_limit, used_limit, status, is_sandbox, created_at, updated_at
	`, casinoID, req.BankName, req.HolderName, req.AccountNumber, req.Currency, req.Country,
		req.DailyLimit, req.MinAmount, req.MaxAmount).Scan(
		&r.ID, &r.BankName, &r.HolderName, &r.AccountNumber, &r.Currency, &r.Country,
		&r.DailyLimit, &r.UsedLimit, &r.Status, &r.IsSandbox, &r.CreatedAt, &r.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &r, nil
}

// DeleteRequisite удаляет реквизит, принадлежащий этому мерчанту.
func (s *Service) DeleteRequisite(ctx context.Context, casinoID, requisiteID uuid.UUID) error {
	tag, err := s.db.Pool.Exec(ctx, `DELETE FROM requisites WHERE id = $1 AND casino_id = $2`, requisiteID, casinoID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}

// TopUpInsurance пополняет страховой депозит и активирует трейдера при достижении порога.
func (s *Service) TopUpInsurance(ctx context.Context, casinoID uuid.UUID, amount float64) (*Profile, error) {
	if amount <= 0 {
		return nil, errors.New("amount must be positive")
	}
	_, err := s.db.Pool.Exec(ctx, `
		UPDATE casinos
		SET insurance_deposit = insurance_deposit + $2,
		    is_active_trader = (insurance_deposit + $2) >= insurance_required,
		    updated_at = NOW()
		WHERE id = $1
	`, casinoID, amount)
	if err != nil {
		return nil, err
	}
	return s.GetProfile(ctx, casinoID)
}
