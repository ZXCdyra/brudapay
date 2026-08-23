package merchant

import (
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/brudapay/brudapay/internal/middleware"
	"github.com/brudapay/brudapay/pkg/jwt"
	"github.com/brudapay/brudapay/pkg/models"
	"github.com/brudapay/brudapay/pkg/response"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// casinoID достаёт casino_id из JWT-claims. Мерчант обязан иметь привязку.
func (h *Handler) casinoID(c *gin.Context) (uuid.UUID, bool) {
	claimsVal, exists := c.Get(middleware.ContextClaimsKey)
	if !exists {
		response.Unauthorized(c, "unauthorized")
		return uuid.Nil, false
	}
	claims := claimsVal.(*jwt.Claims)
	if claims.Role != models.RoleMerchant || claims.CasinoID == nil {
		response.Forbidden(c, "merchant account required")
		return uuid.Nil, false
	}
	return *claims.CasinoID, true
}

func (h *Handler) Dashboard(c *gin.Context) {
	casinoID, ok := h.casinoID(c)
	if !ok {
		return
	}
	data, err := h.service.GetDashboard(c.Request.Context(), casinoID)
	if err != nil {
		response.InternalError(c, "failed to load dashboard")
		return
	}
	response.OK(c, data)
}

func (h *Handler) Profile(c *gin.Context) {
	casinoID, ok := h.casinoID(c)
	if !ok {
		return
	}
	p, err := h.service.GetProfile(c.Request.Context(), casinoID)
	if err != nil {
		response.NotFound(c, "merchant profile not found")
		return
	}
	response.OK(c, p)
}

func (h *Handler) Transactions(c *gin.Context) {
	casinoID, ok := h.casinoID(c)
	if !ok {
		return
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	list, err := h.service.ListTransactions(c.Request.Context(), casinoID, limit, offset)
	if err != nil {
		response.InternalError(c, "failed to load transactions")
		return
	}
	response.OK(c, list)
}

func (h *Handler) Balance(c *gin.Context) {
	casinoID, ok := h.casinoID(c)
	if !ok {
		return
	}
	data, err := h.service.GetDashboard(c.Request.Context(), casinoID)
	if err != nil {
		response.InternalError(c, "failed to load balance")
		return
	}
	response.OK(c, gin.H{
		"balance":        data.Balance,
		"frozen_balance": data.FrozenBalance,
		"currency":       data.Currency,
	})
}

func (h *Handler) ListRequisites(c *gin.Context) {
	casinoID, ok := h.casinoID(c)
	if !ok {
		return
	}
	list, err := h.service.ListRequisites(c.Request.Context(), casinoID)
	if err != nil {
		response.InternalError(c, "failed to load requisites")
		return
	}
	response.OK(c, list)
}

func (h *Handler) CreateRequisite(c *gin.Context) {
	casinoID, ok := h.casinoID(c)
	if !ok {
		return
	}
	var req CreateRequisiteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	r, err := h.service.CreateRequisite(c.Request.Context(), casinoID, req)
	if err != nil {
		if errors.Is(err, ErrNotTrader) {
			response.Forbidden(c, "requisites are available only for trader accounts")
			return
		}
		if errors.Is(err, ErrInsufficientInsurance) {
			response.Forbidden(c, "insurance deposit required to add requisites")
			return
		}
		response.InternalError(c, "failed to create requisite")
		return
	}

	response.OK(c, r)
}

func (h *Handler) DeleteRequisite(c *gin.Context) {
	casinoID, ok := h.casinoID(c)
	if !ok {
		return
	}
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "invalid requisite id")
		return
	}
	if err := h.service.DeleteRequisite(c.Request.Context(), casinoID, id); err != nil {
		response.NotFound(c, "requisite not found")
		return
	}
	response.OK(c, gin.H{"message": "deleted"})
}

func (h *Handler) TopUpInsurance(c *gin.Context) {
	casinoID, ok := h.casinoID(c)
	if !ok {
		return
	}
	var req struct {
		Amount float64 `json:"amount" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	p, err := h.service.TopUpInsurance(c.Request.Context(), casinoID, req.Amount)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	response.OK(c, p)
}

func (h *Handler) RegisterRoutes(rg *gin.RouterGroup, authMiddleware gin.HandlerFunc) {
	m := rg.Group("/merchant")
	m.Use(authMiddleware, middleware.RequireRoles(models.RoleMerchant))
	{
		m.GET("/dashboard", h.Dashboard)
		m.GET("/profile", h.Profile)
		m.GET("/transactions", h.Transactions)
		m.GET("/balance", h.Balance)
		m.GET("/requisites", h.ListRequisites)
		m.POST("/requisites", h.CreateRequisite)
		m.DELETE("/requisites/:id", h.DeleteRequisite)
		m.POST("/insurance/topup", h.TopUpInsurance)
	}
}
