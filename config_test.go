package main

import (
	"os"
	"testing"
)

func TestConfigPath(t *testing.T) {
	home, err := os.UserHomeDir()
	if err != nil {
		t.Fatalf("ホームディレクトリ取得失敗: %v", err)
	}
	configPath := home + "/.config/mycli/mycli.yaml"
	if configPath == "" {
		t.Error("設定ファイルパスが空です")
	}
}
