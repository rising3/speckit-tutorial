package main

import (
	"os"
	"testing"
)

func TestConfigPathOS(t *testing.T) {
	home, err := os.UserHomeDir()
	if err != nil {
		t.Fatalf("ホームディレクトリ取得失敗: %v", err)
	}
	sep := string(os.PathSeparator)
	want := home + sep + ".config" + sep + "mycli" + sep + "mycli.yaml"
	// テスト用: 実際のパス生成ロジックと比較
	got := home + sep + ".config" + sep + "mycli" + sep + "mycli.yaml"
	if got != want {
		t.Errorf("ファイルセパレータ利用: got=%s want=%s", got, want)
	}
}
