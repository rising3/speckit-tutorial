# Implementation Plan: [FEATURE]

**Branch**: `001-cobra-viper-cli-setup` | **Date**: 2025-11-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-cobra-viper-cli-setup/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Go 1.25, cobra, viper, cobra-cliを用いたクロスプラットフォームCLI雛形の自動生成。Makefile, bin出力, internal分離, TDD, CI, README, LICENSE, .gitignore, 設定ファイル（YAML, ホームディレクトリ/.config/mycli/mycli.yaml）を標準装備。help/versionはcobra標準。CLI名・バージョンは定数で管理。

## Technical Context

**Language/Version**: Go 1.25  
**Primary Dependencies**: cobra@latest, viper@latest, cobra-cli@latest  
**Storage**: 設定ファイル（YAML, ホームディレクトリ/.config/mycli/mycli.yaml）  
**Testing**: go test, TDD必須  
**Target Platform**: Linux, macOS, Windows
**Project Type**: CLI（single project, internalパッケージ分離）  
**Performance Goals**: CLI起動・主要コマンドは体感遅延なし  
**Constraints**: gofmt, golangci-lint(govet), bin/出力, Makefile管理, .PHONY明示  
**Scale/Scope**: 雛形生成・単一CLIプロジェクト

## Constitution Check

**GATE: 全項目を満たす（違反・NEEDS CLARIFICATIONなし）**

- Go 1.25、cobra@latest、viper@latestを利用
- main.goをエントリポイント、internalパッケージで内部実装分離
- 設定管理はviper、CLIコマンド・フラグ・設定ファイル一貫性
- gofmt整形、golangci-lint(govet)静的解析パス
- Makefileでビルド・テスト・フォーマット・リンター・.PHONY管理
- バイナリはbin/配下に出力
- すべての新規・追加モジュールに単体テスト、TDDサイクル厳守
- CLIの応答・体感パフォーマンス良好

違反・未定義事項なし

## Project Structure
tests/
ios/ or android/

### Documentation (this feature)

```text
specs/001-cobra-viper-cli-setup/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
mycli/                  # プロジェクトルート
├── main.go             # エントリポイント
├── internal/           # 非公開ロジック
│   └── ...             # サブパッケージ
├── bin/                # ビルド成果物
├── Makefile            # all, build, test, fmt, lint, clean(.PHONY)
├── .github/
│   └── workflows/      # GitHub Actions CI
├── README.md           # 雛形・運用ガイド
├── LICENSE             # Apache
├── .gitignore          # Go向け
├── go.mod, go.sum      # Go Modules
└── 設定ファイル例: ~/.config/mycli/mycli.yaml
```

**Structure Decision**: Go CLI雛形標準構成（main.go, internal/, bin/, Makefile, .github/workflows, README.md, LICENSE, .gitignore, go.mod, 設定ファイルパス）

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
