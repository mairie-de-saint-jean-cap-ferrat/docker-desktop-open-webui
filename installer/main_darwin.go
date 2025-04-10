package main

import (
	"context"
)

const (
    CTL_KERN      = "kern"
    KERN_PROCARGS = 38
)
// checkNvidiaTools retourne toujours "UNSUPPORTED_OS" sur Darwin car le support GPU n'est pas standard.
func checkNvidiaTools(ctx context.Context) string {
	return "UNSUPPORTED_OS"
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
