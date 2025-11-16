package internal

import (
	"testing"
)

func TestEncodeToBase64(t *testing.T) {
	got := EncodeToBase64("hello")
	want := "aGVsbG8="
	if got != want {
		t.Errorf("EncodeToBase64(hello) = %s; want %s", got, want)
	}
}

func TestDecodeFromBase64(t *testing.T) {
	got, err := DecodeFromBase64("aGVsbG8=")
	want := "hello"
	if err != nil || got != want {
		t.Errorf("DecodeFromBase64(aGVsbG8=) = %s, %v; want %s, nil", got, err, want)
	}
}

func TestDecodeFromBase64_Invalid(t *testing.T) {
	_, err := DecodeFromBase64("@@@")
	if err == nil {
		t.Error("DecodeFromBase64(@@@) should return error")
	}
}
