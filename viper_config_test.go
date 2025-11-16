package main

import (
	"os"
	"testing"

	"github.com/spf13/viper"
)

func TestViperConfigFileNotExist(t *testing.T) {
	home, err := os.UserHomeDir()
	if err != nil {
		t.Fatalf("ホームディレクトリ取得失敗: %v", err)
	}
	sep := string(os.PathSeparator)
	configPath := home + sep + ".config" + sep + "mycli"
	viper.Reset()
	viper.AddConfigPath(configPath)
	viper.SetConfigName("notfound") // 存在しないファイル名
	viper.SetConfigType("yaml")
	err = viper.ReadInConfig()
	if err == nil {
		t.Error("存在しない設定ファイルでエラーが返らない")
	}
}

func TestViperConfigFileExist(t *testing.T) {
	home, err := os.UserHomeDir()
	if err != nil {
		t.Fatalf("ホームディレクトリ取得失敗: %v", err)
	}
	sep := string(os.PathSeparator)
	configDir := home + sep + ".config" + sep + "mycli"
	configFile := configDir + sep + "mycli.yaml"
	_ = os.MkdirAll(configDir, 0755)
	f, err := os.Create(configFile)
	if err != nil {
		t.Fatalf("設定ファイル作成失敗: %v", err)
	}
	defer os.Remove(configFile)
	defer f.Close()
	f.WriteString("key: value\n")
	viper.Reset()
	viper.AddConfigPath(configDir)
	viper.SetConfigName("mycli")
	viper.SetConfigType("yaml")
	err = viper.ReadInConfig()
	if err != nil {
		t.Errorf("設定ファイルが存在するのにエラー: %v", err)
	}
	if viper.GetString("key") != "value" {
		t.Error("設定値の読み込みに失敗")
	}
}
