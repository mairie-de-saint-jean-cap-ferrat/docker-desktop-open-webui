package main

import (
	"encoding/json"
	"net/http"
	"os"
	"runtime"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/sirupsen/logrus"
)

// Mirror the frontend AppConfig structure
type AppConfig struct {
	OPENROUTER_API_KEY      string `json:"OPENROUTER_API_KEY"`
	OPENAI_API_KEY          string `json:"OPENAI_API_KEY"`
	AZURE_TTS_KEY           string `json:"AZURE_TTS_KEY"`
	AZURE_TTS_REGION        string `json:"AZURE_TTS_REGION"`
	BRAVE_SEARCH_API_KEY    string `json:"BRAVE_SEARCH_API_KEY"`
	GOOGLE_SEARCH_API_KEY   string `json:"GOOGLE_SEARCH_API_KEY"`
	GOOGLE_SEARCH_ENGINE_ID string `json:"GOOGLE_SEARCH_ENGINE_ID"`
	SERPER_API_KEY          string `json:"SERPER_API_KEY"`
	SERPAPI_API_KEY         string `json:"SERPAPI_API_KEY"`
	SEARCHAPI_API_KEY       string `json:"SEARCHAPI_API_KEY"`
}

const configFilePath = "/data/config.json"
const configDirPath = "/data"

var log = logrus.New() // Make logger accessible globally within the package

// getConfig handler for GET /api/config
func getConfig(c echo.Context) error {
	log.Info("Received request for GET /api/config")
	config := AppConfig{} // Default empty config

	data, err := os.ReadFile(configFilePath)
	if err != nil {
		if os.IsNotExist(err) {
			log.Info("Config file not found, returning default empty config.")
			// Return default empty config if file doesn't exist
			return c.JSON(http.StatusOK, config)
		}
		log.Errorf("Error reading config file: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to read configuration"})
	}

	err = json.Unmarshal(data, &config)
	if err != nil {
		log.Errorf("Error unmarshalling config file: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to parse configuration"})
	}

	log.Info("Successfully loaded config from file.")
	return c.JSON(http.StatusOK, config)
}

// saveConfig handler for POST /api/config
func saveConfig(c echo.Context) error {
	log.Info("Received request for POST /api/config")
	config := new(AppConfig)
	if err := c.Bind(config); err != nil {
		log.Errorf("Error binding request body: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		log.Errorf("Error marshalling config to JSON: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to prepare configuration for saving"})
	}

	// Ensure the /data directory exists
	if err := os.MkdirAll(configDirPath, os.ModePerm); err != nil {
		log.Errorf("Error creating config directory %s: %v", configDirPath, err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create configuration directory"})
	}

	err = os.WriteFile(configFilePath, data, 0644) // rw-r--r--
	if err != nil {
		log.Errorf("Error writing config file: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to save configuration"})
	}

	log.Info("Successfully saved config to file.")
	return c.JSON(http.StatusOK, map[string]string{"message": "Configuration saved successfully"})
}

func getSocketPath() string {
	if runtime.GOOS == "windows" {
		// Windows named pipe format
		return `\\.\pipe\dockerExtensions-ghcr.io_mairie-de-saint-jean-cap-ferrat_docker-desktop-open-webui-backend`
	}
	// Unix socket - Docker Desktop will handle the actual socket path
	return ":8080"
}

func main() {
	log.SetOutput(os.Stdout)
	log.SetLevel(logrus.InfoLevel)

	log.Info("Starting backend service...")

	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{http.MethodGet, http.MethodPost},
	}))

	// Serve static "Hello World" on root, just for basic check
	e.GET("/", func(c echo.Context) error {
		log.Info("Received request for GET /")
		return c.String(http.StatusOK, "Backend service is running.")
	})

	// Add configuration endpoints
	e.GET("/api/config", getConfig)
	e.POST("/api/config", saveConfig)

	socketPath := getSocketPath()
	log.Infof("Starting server on %s...", socketPath)

	if err := e.Start(socketPath); err != nil && err != http.ErrServerClosed {
		log.Fatalf("shutting down the server: %v", err)
	}
}
