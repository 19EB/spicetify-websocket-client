//go:build windows

package main

import (
	"os/exec"
	"syscall"
)

// Start Spotify in its own process group so it outlives this host.
func detach(cmd *exec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{
		CreationFlags: 0x00000008 | 0x00000200, // DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP
	}
}
