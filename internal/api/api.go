package api

import (
	"context"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humachi"
	"github.com/go-chi/chi/v5"

	"github.com/Aephn/TriML/internal/shared"
)

// APIInit initializes the API router and Huma configuration
func APIInit() *chi.Mux {
	router := chi.NewRouter()

	// Initialize Huma with the Chi adapter
	config := huma.DefaultConfig("TriML", "1.0.0")
	api := humachi.New(router, config)

	// Register the health check operation
	huma.Get(api, "/status", func(ctx context.Context, input *struct{}) (*shared.HealthResponse, error) {
		resp := &shared.HealthResponse{}
		resp.Body.Status = "ok"
		return resp, nil
	})

	return router
}
