# mycli

Go + cobra/viper製CLI雛形

## 概要
- Go 1.25, cobra, viper, cobra-cli利用
- クロスプラットフォーム（Linux/macOS/Windows）
- 設定ファイル: YAML（~/.config/mycli/mycli.yaml）
- TDD・CI・Makefile・bin/出力・internal/分離

## カスタマイズ・運用ガイド
- main.go: CLIエントリーポイント。コマンド追加はcmd/配下で管理。
- 設定ファイル: ~/.config/mycli/mycli.yaml を自動ロード。viperで管理。
- internal/: 非公開ロジック配置。テストはinternal_test.go参照。
- bin/: ビルド成果物配置。make buildで生成。
- .github/workflows/ci.yml: PR時にCI自動実行（build/test/fmt/lint）。
- Makefile: all, build, test, fmt, lint, clean, .PHONY明記。

## セットアップ
```sh
go mod tidy
```

## ビルド
```sh
make build
```

## テスト
```sh
make test
```

## フォーマット
```sh
make fmt
```

## Lint
```sh
make lint
```

## クリーン
```sh
make clean
```

## ライセンス
Apache License 2.0
