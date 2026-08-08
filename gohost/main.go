// Standalone host: makes sure Spotify is running with remote debugging, injects the
// websocket client into the xpui page, and mirrors the page's console to the terminal.
//
// The client bundle is embedded, so the binary is self-contained. A client.js placed
// next to the executable overrides it, which allows updating without a rebuild.

package main

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"os"
	"os/signal"
	"path/filepath"
	"regexp"
	"syscall"
	"time"
)

//go:embed client.js
var embeddedClient string

var xpuiPattern = regexp.MustCompile(`(?i)xpui`)

const (
	defaultAddress            = "127.0.0.1"
	defaultPort               = "9090"
	defaultEndpoint           = "/"
	defaultStartOnLaunch      = true
	defaultDebugPort          = 9223
	defaultReconnect          = true
	defaultReconnectDelay     = 1000
	defaultReconnectMaxDelay  = 30000
	spotifyStartTimeout       = 60 * time.Second
	attachTimeout             = 60 * time.Second
)

type clientSettings struct {
	Address           string `json:"websocketAddress"`
	Port              string `json:"websocketPort"`
	Endpoint          string `json:"websocketEndpoint"`
	StartOnLaunch     bool   `json:"startWebsocketOnLaunch"`
	Reconnect         bool   `json:"websocketReconnect"`
	ReconnectDelay    int    `json:"websocketReconnectDelayMs"`
	ReconnectMaxDelay int    `json:"websocketReconnectMaxDelayMs"`
}

func logf(format string, args ...any)  { fmt.Printf("[host] "+format+"\n", args...) }
func warnf(format string, args ...any) { fmt.Fprintf(os.Stderr, "[host] "+format+"\n", args...) }

func exeDir() string {
	path, err := os.Executable()
	if err != nil {
		return "."
	}
	return filepath.Dir(path)
}

func firstExisting(paths ...string) string {
	for _, p := range paths {
		if p == "" {
			continue
		}
		if _, err := os.Stat(p); err == nil {
			return p
		}
	}
	return ""
}

func loadConfig(path string) iniFile {
	data, err := os.ReadFile(path)
	if err != nil {
		warnf("no config at %s, using defaults", path)
		return iniFile{}
	}
	logf("config: %s", path)
	return parseIni(string(data))
}

// A client.js next to the binary wins over the embedded copy.
func loadClientBundle() (string, string) {
	override := filepath.Join(exeDir(), "client.js")
	if data, err := os.ReadFile(override); err == nil {
		return string(data), override
	}
	return embeddedClient, "embedded"
}

func formatArg(arg remoteObject) string {
	if len(arg.Value) > 0 {
		var text string
		if json.Unmarshal(arg.Value, &text) == nil {
			return text
		}
		return string(arg.Value)
	}
	if arg.UnserializableValue != "" {
		return arg.UnserializableValue
	}
	if arg.Preview != nil && len(arg.Preview.Properties) > 0 {
		parts := make([]string, 0, len(arg.Preview.Properties))
		for _, p := range arg.Preview.Properties {
			parts = append(parts, fmt.Sprintf("%s: %s", p.Name, p.Value))
		}
		name := arg.ClassName
		if name == "" {
			name = "Object"
		}
		return fmt.Sprintf("%s { %s }", name, joinComma(parts))
	}
	if arg.Description != "" {
		return arg.Description
	}
	if arg.ClassName != "" {
		return arg.ClassName
	}
	return arg.Type
}

func joinComma(parts []string) string {
	out := ""
	for i, p := range parts {
		if i > 0 {
			out += ", "
		}
		out += p
	}
	return out
}

func mirrorConsole(s *session) {
	s.on("Runtime.consoleAPICalled", func(params json.RawMessage) {
		var event struct {
			Type string         `json:"type"`
			Args []remoteObject `json:"args"`
		}
		if json.Unmarshal(params, &event) != nil {
			return
		}
		parts := make([]string, 0, len(event.Args))
		for _, arg := range event.Args {
			parts = append(parts, formatArg(arg))
		}
		text := ""
		for i, p := range parts {
			if i > 0 {
				text += " "
			}
			text += p
		}
		fmt.Printf("[spotify:%s] %s\n", event.Type, text)
	})

	s.on("Runtime.exceptionThrown", func(params json.RawMessage) {
		var event struct {
			ExceptionDetails exceptionDetails `json:"exceptionDetails"`
		}
		if json.Unmarshal(params, &event) != nil {
			return
		}
		detail := event.ExceptionDetails.Text
		if event.ExceptionDetails.Exception != nil && event.ExceptionDetails.Exception.Description != "" {
			detail = event.ExceptionDetails.Exception.Description
		}
		fmt.Fprintf(os.Stderr, "[spotify:exception] %s\n", detail)
	})
}

func prepareSession(s *session, injection string) error {
	if _, err := s.send("Runtime.enable", nil); err != nil {
		return err
	}
	if _, err := s.send("Page.enable", nil); err != nil {
		return err
	}
	mirrorConsole(s)
	// Covers future reloads; the evaluate covers the page as it stands right now.
	if _, err := s.send("Page.addScriptToEvaluateOnNewDocument", map[string]any{"source": injection}); err != nil {
		return err
	}
	return s.evaluate(injection, false)
}

func run() error {
	configPath := ""
	if len(os.Args) > 1 {
		configPath = os.Args[1]
	} else {
		configPath = firstExisting(
			filepath.Join(exeDir(), "websocket-client.ini"),
			"websocket-client.ini",
		)
		if configPath == "" {
			configPath = filepath.Join(exeDir(), "websocket-client.ini")
		}
	}

	config := loadConfig(configPath)
	websocketSection := config.section("websocket")
	spotifySection := config.section("spotify")

	settings := clientSettings{
		Address:           str(websocketSection, "address", defaultAddress),
		Port:              str(websocketSection, "port", defaultPort),
		Endpoint:          str(websocketSection, "endpoint", defaultEndpoint),
		StartOnLaunch:     boolean(websocketSection, "startOnLaunch", defaultStartOnLaunch),
		Reconnect:         boolean(websocketSection, "reconnect", defaultReconnect),
		ReconnectDelay:    integer(websocketSection, "reconnectDelayMs", defaultReconnectDelay),
		ReconnectMaxDelay: integer(websocketSection, "reconnectMaxDelayMs", defaultReconnectMaxDelay),
	}
	debugPort := integer(spotifySection, "debugPort", defaultDebugPort)

	logf("target ws://%s:%s%s", settings.Address, settings.Port, settings.Endpoint)

	state, err := ensureSpotify(
		debugPort,
		str(spotifySection, "executable", ""),
		boolean(spotifySection, "restart", true),
		spotifyStartTimeout,
	)
	if err != nil {
		return err
	}
	logf("spotify %s on debug port %d", state, debugPort)

	bundle, source := loadClientBundle()
	logf("client bundle: %s (%d bytes)", source, len(bundle))

	encoded, err := json.Marshal(settings)
	if err != nil {
		return err
	}
	injection := fmt.Sprintf("globalThis.__WS_CLIENT_CONFIG__ = %s;\n%s", encoded, bundle)

	s, err := attach(debugPort, xpuiPattern, attachTimeout)
	if err != nil {
		return err
	}
	if err := prepareSession(s, injection); err != nil {
		return err
	}
	logf("attached to %s", s.target.URL)
	logf("client injected")
	logf("running -- press Ctrl+C to stop")

	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt, syscall.SIGTERM)

	// If Spotify navigates or the target dies, reattach and inject again.
	for {
		select {
		case <-interrupt:
			logf("shutting down")
			s.close()
			return nil
		case <-s.done():
			logf("session lost, reattaching...")
			next, err := attach(debugPort, xpuiPattern, attachTimeout)
			if err != nil {
				warnf("reattach failed: %v", err)
				return err
			}
			if err := prepareSession(next, injection); err != nil {
				warnf("reinject failed: %v", err)
				return err
			}
			s = next
			logf("reattached and reinjected")
		}
	}
}

func main() {
	if err := run(); err != nil {
		fmt.Fprintf(os.Stderr, "[host] fatal: %v\n", err)
		os.Exit(1)
	}
}
