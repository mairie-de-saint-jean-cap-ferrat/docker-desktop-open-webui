//go:build windows

package main

import (
	"net"

	"github.com/Microsoft/go-winio"
)

// listen creates a Windows named pipe listener.
func listen(path string) (net.Listener, error) {
	// Configuration des named pipes Windows
	pipeConfig := &winio.PipeConfig{
		SecurityDescriptor: "", // Utiliser un descripteur vide permet l'accès à tous les utilisateurs
		MessageMode:        true,
		InputBufferSize:    65536,
		OutputBufferSize:   65536,
	}
	// Le chemin sur Windows doit commencer par "\\.\pipe\"
	// Si le chemin n'est pas correctement formaté, on l'adapte
	if path[0] != '\\' {
		path = `\\.\pipe\` + path
	}
	return winio.ListenPipe(path, pipeConfig)
} 