package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)

type ensureResult string

const (
	alreadyListening ensureResult = "already-listening"
	launched         ensureResult = "launched"
	restarted        ensureResult = "restarted"
)

func findSpotifyExecutable() string {
	var candidates []string

	switch runtime.GOOS {
	case "windows":
		candidates = []string{
			filepath.Join(os.Getenv("APPDATA"), "Spotify", "Spotify.exe"),
			filepath.Join(os.Getenv("LOCALAPPDATA"), "Microsoft", "WindowsApps", "Spotify.exe"),
			filepath.Join(os.Getenv("PROGRAMFILES"), "Spotify", "Spotify.exe"),
		}
	case "darwin":
		candidates = []string{"/Applications/Spotify.app/Contents/MacOS/Spotify"}
	default:
		candidates = []string{"/usr/bin/spotify", "/usr/share/spotify/spotify", "/snap/bin/spotify"}
	}

	for _, candidate := range candidates {
		if candidate == "" {
			continue
		}
		if info, err := os.Stat(candidate); err == nil && !info.IsDir() {
			return candidate
		}
	}
	return ""
}

func spotifyRunning() bool {
	switch runtime.GOOS {
	case "windows":
		out, err := exec.Command("tasklist", "/FI", "IMAGENAME eq Spotify.exe").Output()
		return err == nil && strings.Contains(strings.ToLower(string(out)), "spotify.exe")
	default:
		return exec.Command("pgrep", "-x", "Spotify").Run() == nil
	}
}

func killSpotify() {
	switch runtime.GOOS {
	case "windows":
		_ = exec.Command("taskkill", "/F", "/IM", "Spotify.exe").Run()
	default:
		_ = exec.Command("pkill", "-x", "Spotify").Run()
	}
	time.Sleep(2 * time.Second)
}

func launchSpotify(executable string, port int) error {
	cmd := exec.Command(executable, fmt.Sprintf("--remote-debugging-port=%d", port))
	detach(cmd)
	if err := cmd.Start(); err != nil {
		return err
	}
	// Let it run independently of this process.
	go func() { _ = cmd.Wait() }()
	return nil
}

// Guarantees a Spotify client reachable on port, restarting it when the debug port is
// closed. Spotify enforces a single instance, so an already-running client silently
// ignores the launch flag -- it has to be killed first.
func ensureSpotify(port int, executable string, restartIfNeeded bool, timeout time.Duration) (ensureResult, error) {
	if debuggerUp(port) {
		return alreadyListening, nil
	}

	exe := executable
	if exe == "" {
		exe = findSpotifyExecutable()
	}
	if exe == "" {
		return "", fmt.Errorf("could not find Spotify. Set [spotify] executable=<path> in the config file")
	}
	if _, err := os.Stat(exe); err != nil {
		return "", fmt.Errorf("configured Spotify executable does not exist: %s", exe)
	}

	wasRunning := spotifyRunning()
	if wasRunning && !restartIfNeeded {
		return "", fmt.Errorf(
			"Spotify is running without remote debugging on port %d. Close it, or set [spotify] restart=true", port)
	}
	if wasRunning {
		killSpotify()
	}
	if err := launchSpotify(exe, port); err != nil {
		return "", fmt.Errorf("failed to launch Spotify: %w", err)
	}

	deadline := time.Now().Add(timeout)
	for {
		if debuggerUp(port) {
			if wasRunning {
				return restarted, nil
			}
			return launched, nil
		}
		if time.Now().After(deadline) {
			return "", fmt.Errorf("Spotify did not open the debug port %d within %s", port, timeout)
		}
		time.Sleep(500 * time.Millisecond)
	}
}
