package main

import (
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/sirupsen/logrus"
)

func main() {
	log := logrus.New()
	log.SetOutput(os.Stdout)
	log.SetLevel(logrus.InfoLevel)

	log.Info("Starting backend service...")

	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"}, // Keep CORS for potential future use
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
	}))

	e.GET("/", func(c echo.Context) error {
		log.Info("Received request for /")
		return c.String(http.StatusOK, "Hello from Docker Extension backend! This backend is currently minimal.")
	})

	// The API key logic is now handled in the frontend

	log.Info("Starting server on port 8080...")
	// Note: Docker Desktop handles communication via sockets, not direct port exposure typically.
	// The :8080 is for the container's internal listener.
	if err := e.Start(":8080"); err != nil && err != http.ErrServerClosed {
		log.Fatalf("shutting down the server: %v", err)
	}
}
