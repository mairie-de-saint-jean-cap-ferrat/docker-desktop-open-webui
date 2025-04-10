package main

import (
	"archive/tar"
	"compress/gzip"
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strconv"

	"golang.org/x/sys/unix"
)

// Renommer la fonction en checkNvidiaTools_linux
func checkNvidiaTools_linux(ctx context.Context) string {
	_, err := exec.LookPath("nvidia-smi")
	if err == nil {
		// nvidia-smi trouvé dans le PATH
		return "OK"
	}
	if errors.Is(err, exec.ErrNotFound) {
		// nvidia-smi non trouvé
		return "NVIDIA_TOOLS_NOT_FOUND"
	}
	// Autre erreur lors de la recherche
	fmt.Printf("Error checking for nvidia-smi on Linux: %v\n", err) // Log to stderr for debugging
	return "ERROR"
}

// Les fonctions suivantes ne sont plus nécessaires car Ollama n'est plus géré ici.
/*
func findExecutable(ctx context.Context, defaultOnly bool) string {
	// ... code supprimé ...
}

func installOllama(ctx context.Context, release, installPath string) (string, error) {
  // ... code supprimé ...
}

func uninstallOllama(ctx context.Context) error {
	// ... code supprimé ...
}

func terminateProcess(ctx context.Context, executablePath string) error {
	// ... code supprimé ...
}
*/
