package main

import (
	"context"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

// Renommer la fonction en checkNvidiaTools_windows
func checkNvidiaTools_windows(ctx context.Context) string {
	// 1. Vérifier dans le PATH
	_, errPath := exec.LookPath("nvidia-smi.exe")
	if errPath == nil {
		return "OK"
	}
	if !errors.Is(errPath, exec.ErrNotFound) {
		fmt.Printf("Error looking for nvidia-smi.exe in PATH: %v\n", errPath)
	}

	// 2. Vérifier le chemin d'installation standard
	standardPath := filepath.Join(os.Getenv("ProgramFiles"), "NVIDIA Corporation", "NVSMI", "nvidia-smi.exe")
	_, errStat := os.Stat(standardPath)
	if errStat == nil {
		return "OK"
	}
	if !errors.Is(errStat, os.ErrNotExist) {
		fmt.Printf("Error stating standard nvidia-smi.exe path (%s): %v\n", standardPath, errStat)
		return "ERROR"
	}

	return "NVIDIA_TOOLS_NOT_FOUND"
}
