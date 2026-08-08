package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type cdpTarget struct {
	Type                 string `json:"type"`
	URL                  string `json:"url"`
	WebSocketDebuggerURL string `json:"webSocketDebuggerUrl"`
}

type remoteObject struct {
	Type                string          `json:"type"`
	ClassName           string          `json:"className"`
	Value               json.RawMessage `json:"value"`
	UnserializableValue string          `json:"unserializableValue"`
	Description         string          `json:"description"`
	Preview             *struct {
		Properties []struct {
			Name  string `json:"name"`
			Value string `json:"value"`
		} `json:"properties"`
	} `json:"preview"`
}

type exceptionDetails struct {
	Text      string        `json:"text"`
	Exception *remoteObject `json:"exception"`
}

type cdpMessage struct {
	ID     int             `json:"id,omitempty"`
	Method string          `json:"method,omitempty"`
	Params json.RawMessage `json:"params,omitempty"`
	Result json.RawMessage `json:"result,omitempty"`
	Error  *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

type session struct {
	target cdpTarget

	conn     *websocket.Conn
	writeMu  sync.Mutex
	mu       sync.Mutex
	nextID   int
	pending  map[int]chan cdpMessage
	handlers map[string][]func(json.RawMessage)
	closed   chan struct{}
	once     sync.Once
}

func httpGetJSON(url string, out any) error {
	client := &http.Client{Timeout: 3 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	return json.NewDecoder(resp.Body).Decode(out)
}

func debuggerUp(port int) bool {
	var version map[string]any
	return httpGetJSON(fmt.Sprintf("http://127.0.0.1:%d/json/version", port), &version) == nil
}

// Waits for a page target matching pattern, then connects to it.
func attach(port int, pattern *regexp.Regexp, timeout time.Duration) (*session, error) {
	deadline := time.Now().Add(timeout)

	for {
		var targets []cdpTarget
		if err := httpGetJSON(fmt.Sprintf("http://127.0.0.1:%d/json/list", port), &targets); err == nil {
			for _, t := range targets {
				if t.Type == "page" && pattern.MatchString(t.URL) && t.WebSocketDebuggerURL != "" {
					return dial(t)
				}
			}
		}
		if time.Now().After(deadline) {
			return nil, fmt.Errorf("no page target matching %s appeared within %s", pattern, timeout)
		}
		time.Sleep(500 * time.Millisecond)
	}
}

func dial(target cdpTarget) (*session, error) {
	dialer := websocket.Dialer{
		HandshakeTimeout: 10 * time.Second,
		ReadBufferSize:   64 * 1024,
		WriteBufferSize:  64 * 1024,
	}
	conn, _, err := dialer.Dial(target.WebSocketDebuggerURL, nil)
	if err != nil {
		return nil, err
	}
	conn.SetReadLimit(256 * 1024 * 1024)

	s := &session{
		target:   target,
		conn:     conn,
		nextID:   1,
		pending:  map[int]chan cdpMessage{},
		handlers: map[string][]func(json.RawMessage){},
		closed:   make(chan struct{}),
	}
	go s.readLoop()
	return s, nil
}

func (s *session) readLoop() {
	defer s.close()
	for {
		_, data, err := s.conn.ReadMessage()
		if err != nil {
			return
		}

		var msg cdpMessage
		if json.Unmarshal(data, &msg) != nil {
			continue
		}

		if msg.ID != 0 {
			s.mu.Lock()
			ch, ok := s.pending[msg.ID]
			delete(s.pending, msg.ID)
			s.mu.Unlock()
			if ok {
				ch <- msg
			}
			continue
		}

		s.mu.Lock()
		listeners := append([]func(json.RawMessage){}, s.handlers[msg.Method]...)
		s.mu.Unlock()
		for _, listener := range listeners {
			listener(msg.Params)
		}
	}
}

func (s *session) on(method string, handler func(json.RawMessage)) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.handlers[method] = append(s.handlers[method], handler)
}

func (s *session) send(method string, params map[string]any) (json.RawMessage, error) {
	s.mu.Lock()
	id := s.nextID
	s.nextID++
	ch := make(chan cdpMessage, 1)
	s.pending[id] = ch
	s.mu.Unlock()

	payload, err := json.Marshal(map[string]any{"id": id, "method": method, "params": params})
	if err != nil {
		return nil, err
	}

	s.writeMu.Lock()
	err = s.conn.WriteMessage(websocket.TextMessage, payload)
	s.writeMu.Unlock()
	if err != nil {
		return nil, err
	}

	select {
	case msg := <-ch:
		if msg.Error != nil {
			return nil, fmt.Errorf("%s: %s", method, msg.Error.Message)
		}
		return msg.Result, nil
	case <-s.closed:
		return nil, fmt.Errorf("%s: session closed", method)
	case <-time.After(60 * time.Second):
		return nil, fmt.Errorf("%s: timed out", method)
	}
}

func (s *session) evaluate(expression string, awaitPromise bool) error {
	raw, err := s.send("Runtime.evaluate", map[string]any{
		"expression":     expression,
		"awaitPromise":   awaitPromise,
		"returnByValue":  true,
		"userGesture":    true,
		"replMode":       false,
		"silent":         false,
		"generatePreview": false,
	})
	if err != nil {
		return err
	}

	var result struct {
		ExceptionDetails *exceptionDetails `json:"exceptionDetails"`
	}
	if json.Unmarshal(raw, &result) == nil && result.ExceptionDetails != nil {
		detail := result.ExceptionDetails
		if detail.Exception != nil && detail.Exception.Description != "" {
			return fmt.Errorf("%s", detail.Exception.Description)
		}
		return fmt.Errorf("%s", detail.Text)
	}
	return nil
}

func (s *session) close() {
	s.once.Do(func() {
		close(s.closed)
		s.conn.Close()
	})
}

func (s *session) done() <-chan struct{} {
	return s.closed
}
