// mycli: Go + cobra/viper CLI雛形
//
// - コマンド追加はcmd/配下で管理
// - 設定ファイルは~/.config/mycli/mycli.yaml（viper管理）
// - internal/は非公開ロジック用
// - bin/はビルド成果物配置
// - 詳細はREADME.md参照

package main

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

const (
	cliName    = "mycli"
	cliVersion = "dev"
)

var rootCmd = &cobra.Command{
	Use:     cliName,
	Short:   "mycli: Go + cobra/viper CLI雛形",
	Version: cliVersion,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("Hello from mycli!")
	},
}

func initConfig() {
	home, err := os.UserHomeDir()
	if err != nil {
		fmt.Println("ホームディレクトリ取得失敗:", err)
		os.Exit(1)
	}
	configPath := home + "/.config/mycli"
	viper.AddConfigPath(configPath)
	viper.SetConfigName("mycli")
	viper.SetConfigType("yaml")
	_ = viper.ReadInConfig() // 設定ファイルがなくてもエラーにしない
}

func main() {
	cobra.OnInitialize(initConfig)
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
