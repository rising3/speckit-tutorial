// mycli: Go + cobra/viper CLI雛形
//
// - コマンド追加はcmd/配下で管理
// - 設定ファイルは~/.config/mycli/mycli.yaml（viper管理）
// - internal/は非公開ロジック用
// - bin/はビルド成果物配置
// - 詳細はREADME.md参照

package main

import (
	"mycli/cmd"
)

func main() {
	cmd.Execute()
}
