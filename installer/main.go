// Package main vérifie les prérequis GPU.
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"runtime"
)

func main() {
	ctx := context.Background()
	log.SetFlags(0)
	log.SetOutput(os.Stderr)

	checkGPUSupportAndPrintStatus(ctx)
}

func checkGPUSupportAndPrintStatus(ctx context.Context) {
	status := checkNvidiaTools(ctx)

	if status == "UNKNOWN_OS" || status == "UNSUPPORTED_OS"{
		log.Printf("GPU check not applicable or OS (%s) unsupported.", runtime.GOOS)
	} else if status != "OK" && status != "NVIDIA_TOOLS_NOT_FOUND" && status != "ERROR" {
		log.Printf("Unexpected GPU check status: %s", status)
	}

	fmt.Println(status)

	if status == "ERROR" {
		os.Exit(1)
	} else {
		os.Exit(0)
	}
}

// Renommer les fonctions spécifiques pour éviter les conflits de noms directs
// et les appeler explicitement depuis le switch basé sur runtime.GOOS.
// Les définitions réelles seront dans les fichiers _os.go

// func checkNvidiaTools_linux(ctx context.Context) string { /* défini dans main_linux.go */ }
// func checkNvidiaTools_windows(ctx context.Context) string { /* défini dans main_windows.go */ }
// func checkNvidiaTools_darwin(ctx context.Context) string { /* défini dans main_darwin.go */ }

// ... Supprimer l'ancien code commenté ...
