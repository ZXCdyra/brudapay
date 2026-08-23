package database

import (
	"context"
	"fmt"
	"net"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// ipv4Dialer forces IPv4-only connections (fixes IPv6 issues on Render/free plans)
type ipv4Dialer struct{}

func (d *ipv4Dialer) Dial(ctx context.Context, network, address string) (net.Conn, error) {
	if network == "tcp" {
		network = "tcp4"
	}
	return net.Dial(network, address)
}

type DB struct {
	Pool *pgxpool.Pool
}

func Connect(ctx context.Context, url string) (*DB, error) {
	cfg, err := pgxpool.ParseConfig(url)
	if err != nil {
		return nil, fmt.Errorf("parse config: %w", err)
	}
	cfg.MaxConns = 25
	cfg.MinConns = 5
	cfg.MaxConnLifetime = time.Hour
	cfg.MaxConnIdleTime = 30 * time.Minute

	// Force IPv4 to work around IPv6 unavailability on Render free plan
	cfg.ConnConfig.DialFunc = (&ipv4Dialer{}).Dial

	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("connect: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("ping: %w", err)
	}

	return &DB{Pool: pool}, nil
}

func (db *DB) Close() {
	db.Pool.Close()
}

func (db *DB) Health(ctx context.Context) error {
	return db.Pool.Ping(ctx)
}
