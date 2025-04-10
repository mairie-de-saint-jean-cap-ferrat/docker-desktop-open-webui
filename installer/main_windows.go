package main

import (
	"archive/zip"
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
	"unsafe"

	"github.com/xenking/zipstream"
	"golang.org/x/sys/windows"
)

// checkNvidiaTools vérifie la présence de nvidia-smi.exe sur Windows.
func checkNvidiaTools(ctx context.Context) string {
	// 1. Vérifier dans le PATH
	_, errPath := exec.LookPath("nvidia-smi.exe")
	if errPath == nil {
		return "OK"
	}
	if !errors.Is(errPath, exec.ErrNotFound) {
		// Une erreur inattendue s'est produite lors de la recherche dans le PATH
		fmt.Printf("Error looking for nvidia-smi.exe in PATH: %v\n", errPath)
		// Continuer pour vérifier le chemin standard
	}

	// 2. Vérifier le chemin d'installation standard
	standardPath := filepath.Join(os.Getenv("ProgramFiles"), "NVIDIA Corporation", "NVSMI", "nvidia-smi.exe")
	_, errStat := os.Stat(standardPath)
	if errStat == nil {
		return "OK"
	}
	if !errors.Is(errStat, os.ErrNotExist) {
		// Une erreur inattendue s'est produite lors de la vérification du fichier
		fmt.Printf("Error stating standard nvidia-smi.exe path (%s): %v\n", standardPath, errStat)
		return "ERROR"
	}

	// Non trouvé dans le PATH ni dans le chemin standard
	return "NVIDIA_TOOLS_NOT_FOUND"
}
