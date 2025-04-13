//go:build !windows

package main

import (
	"net"
)

// listen creates a Unix domain socket listener for non-Windows systems.
func listen(path string) (net.Listener, error) {
	return net.Listen("unix", path)
} 