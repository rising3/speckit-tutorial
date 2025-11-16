package main

import (
	"os/exec"
	"strings"
	"testing"
)

func TestEncodeDecode_StdinArgPriority(t *testing.T) {
	cmd := exec.Command("go", "run", "..", "base64", "encode", "should_not_use_this")
	cmd.Stdin = strings.NewReader("use_stdin")
	out, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("encode failed: %v, out=%s", err, out)
	}
	if !strings.Contains(string(out), "dXNlX3N0ZGlu") {
		t.Errorf("stdin優先でエンコードされていない: got %s", out)
	}
}

func TestEncodeDecode_EmptyInput(t *testing.T) {
	cmd := exec.Command("go", "run", "..", "base64", "encode")
	out, err := cmd.CombinedOutput()
	if err == nil {
		t.Errorf("空入力時はエラー終了すべき: got %s", out)
	}
}

func TestDecode_InvalidBase64(t *testing.T) {
	cmd := exec.Command("go", "run", "..", "base64", "decode", "@@@")
	out, err := cmd.CombinedOutput()
	if err == nil {
		t.Errorf("不正base64でエラーにならない: out=%s", out)
	}
}
