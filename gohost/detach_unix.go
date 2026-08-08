//go:build !windows

package main

import (
	"os/exec"
	"syscall"
)

// Start Spotify in its own session so it outlives this host.
func detach(cmd *exec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{Setsid: true}
}
