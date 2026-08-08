package main

import (
	"strconv"
	"strings"
)

// Section name -> key -> value. Keys outside any [section] land in "".
type iniFile map[string]map[string]string

func parseIni(text string) iniFile {
	result := iniFile{"": {}}
	section := ""

	for _, raw := range strings.Split(text, "\n") {
		line := strings.TrimSpace(strings.TrimSuffix(raw, "\r"))
		if line == "" || strings.HasPrefix(line, ";") || strings.HasPrefix(line, "#") {
			continue
		}

		if strings.HasPrefix(line, "[") && strings.HasSuffix(line, "]") {
			section = strings.TrimSpace(line[1 : len(line)-1])
			if _, ok := result[section]; !ok {
				result[section] = map[string]string{}
			}
			continue
		}

		eq := strings.Index(line, "=")
		if eq < 0 {
			continue
		}
		key := strings.TrimSpace(line[:eq])
		value := strings.TrimSpace(line[eq+1:])
		if key != "" {
			result[section][key] = value
		}
	}

	return result
}

func (f iniFile) section(name string) map[string]string {
	if s, ok := f[name]; ok {
		return s
	}
	return map[string]string{}
}

func str(section map[string]string, key, fallback string) string {
	if v, ok := section[key]; ok && v != "" {
		return v
	}
	return fallback
}

func boolean(section map[string]string, key string, fallback bool) bool {
	v, ok := section[key]
	if !ok || v == "" {
		return fallback
	}
	switch strings.ToLower(strings.TrimSpace(v)) {
	case "1", "true", "yes", "on":
		return true
	case "0", "false", "no", "off":
		return false
	}
	return fallback
}

func integer(section map[string]string, key string, fallback int) int {
	v, ok := section[key]
	if !ok {
		return fallback
	}
	n, err := strconv.Atoi(strings.TrimSpace(v))
	if err != nil || n <= 0 {
		return fallback
	}
	return n
}
