package internal

import (
	"encoding/base64"
	"errors"
)

// EncodeToBase64 encodes input string to base64
func EncodeToBase64(input string) string {
	return base64.StdEncoding.EncodeToString([]byte(input))
}

// DecodeFromBase64 decodes base64 string to plain text
func DecodeFromBase64(b64 string) (string, error) {
	decoded, err := base64.StdEncoding.DecodeString(b64)
	if err != nil {
		return "", errors.New("invalid base64 input")
	}
	return string(decoded), nil
}
