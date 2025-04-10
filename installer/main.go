// Package main vérifie les prérequis GPU.
package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"slices"
	"time"
)

// checkNvidiaTools est une fonction définie dans les fichiers spécifiques à l'OS (main_linux.go, main_windows.go, main_darwin.go)
// Elle retourne "OK", "NVIDIA_TOOLS_NOT_FOUND", "UNSUPPORTED_OS", ou "ERROR".
// Sa déclaration ici permet au code commun de l'appeler.
// La définition réelle est fournie par le fichier spécifique à la plateforme lors de la compilation.
var checkNvidiaTools func(ctx context.Context) string

func main() {
	ctx := context.Background()
	// Configuration minimale du log
	log.SetFlags(0)
	log.SetOutput(os.Stderr)

	// Supprimer la gestion des flags et des modes
	// flag.Func(...) et flag.Parse() sont supprimés

	// Appeler directement la fonction de vérification GPU
	checkGPUSupportAndPrintStatus(ctx)
}

// checkGPUSupportAndPrintStatus exécute la vérification spécifique à l'OS et imprime le résultat.
func checkGPUSupportAndPrintStatus(ctx context.Context) {
	// Utiliser runtime.GOOS pour choisir la bonne implémentation si nécessaire,
	// mais la compilation conditionnelle gère déjà cela pour checkNvidiaTools.
	status := "UNKNOWN_OS" // Default status
	switch runtime.GOOS {
	case "linux", "windows", "darwin":
		// La fonction checkNvidiaTools spécifique à l'OS sera liée à la compilation.
		if checkNvidiaTools != nil { // Vérification de sécurité
			status = checkNvidiaTools(ctx)
		} else {
			log.Println("Error: checkNvidiaTools function is not linked for", runtime.GOOS)
			status = "ERROR"
		}
	default:
		status = "UNSUPPORTED_OS" // Marquer explicitement les OS non gérés
		log.Printf("Unsupported operating system: %s", runtime.GOOS)
	}

	// Imprimer le statut sur stdout pour que l'UI React puisse le lire
	fmt.Println(status)

	// Terminer proprement. Pas besoin de log.Fatal car ce n'est pas une erreur fatale
	// si les outils ne sont pas trouvés, c'est juste un état.
	if status == "ERROR" {
		os.Exit(1) // Quitter avec un code d'erreur en cas d'erreur réelle
	} else {
		os.Exit(0)
	}
}

// Les fonctions suivantes ne sont plus nécessaires
/*
const (
	checkURL = "http://localhost:11434/api/tags"
)

type Mode string
// ... autres constantes Mode ...

var (
	mode           = ModeInstall
	allModes       = []Mode{...}
	releaseVersion = flag.String(...)
	pullModel      = flag.String(...)
)

func checkExistingInstance(ctx context.Context) (bool, error) {
	// ... code supprimé ...
}

func install(ctx context.Context) error {
	// ... code supprimé ...
}

type releaseInfo struct { ... }
ntype assetInfo struct { ... }

func getReleaseAssetURL(ctx context.Context, release, assetName string) (string, error) {
	// ... code supprimé ...
}

func getDefaultInstallLocation(ctx context.Context) (string, error) {
	// ... code supprimé ...
}

func checkInstall(ctx context.Context) error {
	// ... code supprimé ...
}

func startOllama(ctx context.Context) error {
	// ... code supprimé ...
}

func shutdownOllama(ctx context.Context) error {
	// ... code supprimé ...
}
*/
