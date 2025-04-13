package main

import (
	"encoding/json"
	"flag"
	"net"
	"net/http"
	"os"

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

// Simple root handler (Keep or modify as needed)
func rootHandler(c echo.Context) error {
	log.Info("Received request for GET /")
	return c.String(http.StatusOK, "Backend service is running via Unix socket.")
}

// listen function is now in platform-specific files (listen_unix.go, listen_windows.go)

func main() {
	// Utilisation de flag comme dans le template
	var socketPath string
	flag.StringVar(&socketPath, "socket", "/run/guest-services/backend.sock", "Unix domain socket to listen on")
	flag.Parse()

	// Suppression du socket existant
	_ = os.RemoveAll(socketPath)

	// Configuration du logger
	log.SetOutput(os.Stdout)
	log.SetLevel(logrus.InfoLevel)


	// Remove the socket file if it already exists to avoid bind errors on restart
	if _, err := os.Stat(socketPath); err == nil {
		log.Warnf("Removing existing socket file: %s", socketPath)
		if err := os.Remove(socketPath); err != nil {
			log.Fatalf("Failed to remove existing socket file %s: %v", socketPath, err)
		}
	}

	log.Infof("Starting backend service, attempting to listen on Unix socket: %s", socketPath)

	// Create the Echo instance
	router := echo.New()
	router.HideBanner = true // Optional: hide Echo framework banner

	// Add middleware (optional, keep if needed)
	router.Use(middleware.Logger())
	router.Use(middleware.Recover())

	// Define routes
	router.GET("/", rootHandler)
	router.GET("/api/config", getConfig)
	router.POST("/api/config", saveConfig)

	// Listen on the Unix socket *exactly* as shown in Docker docs examples
	ln, err := net.Listen("unix", socketPath)
	if err != nil {
		log.Fatalf("Failed to listen on Unix socket %s: %v", socketPath, err)
	}
	// No defer ln.Close() needed here, Echo handles closing the listener

	// Set permissions AFTER successful listen, before starting server
	// Using 0777 for broad compatibility within the VM context, adjust if specific permissions are needed.
	if err := os.Chmod(socketPath, 0777); err != nil {
		ln.Close() // Clean up listener if chmod fails
		log.Fatalf("Failed to set permissions on socket file %s: %v", socketPath, err)
	}

	log.Infof("Successfully listening on Unix socket: %s", socketPath)

	// Tell Echo to use the Unix socket listener instead of TCP
	router.Listener = ln

	// Start the server. The address string is ignored when Listener is set.
	if err := router.Start(""); err != nil && err != http.ErrServerClosed {
		ln.Close() // Ensure listener is closed on fatal error during startup
		log.Fatalf("Shutting down the server: %v", err)
	}
}
