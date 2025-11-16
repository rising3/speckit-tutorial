# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Go 1.25  
**Primary Dependencies**: cobra@latest, viper@latest  
**Storage**: N/A（ファイル・DB不要）  
**Testing**: go test（単体テスト必須）、golangci-lint（govetのみ）、gofmt  
**Target Platform**: macOS/Linux CLI  
**Project Type**: single（CLIツール、cmd/に1ファイル、internal/に共通処理）  
**Performance Goals**: CLI応答10秒以内、体感遅延なし  
**Constraints**: bin/配下にバイナリ出力、Makefileで全管理、TDDサイクル遵守、標準入力・引数両対応  
**Scale/Scope**: サブコマンド・共通処理・テスト含め1000行未満想定

## Constitution Check


**GATE: フェーズ0開始前・フェーズ1設計後に必ず下記を満たすこと**

- Go 1.25、cobra@latest、viper@latestを利用する
- main.goをエントリポイントとし、internalパッケージで内部実装を分離する
- 設定管理はviperで一元化する
- gofmtで整形、golangci-lint（govetのみ）で静的解析をパスする
- Makefileでビルド・テスト・フォーマット・リンター・.PHONY管理を徹底する
- バイナリはbin/配下に出力する
- すべての新規・追加モジュールに単体テストがあり、TDDサイクルを守る
- CLIの応答・体感パフォーマンスに問題がない

現時点で違反はありません。

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
ios/ or android/
```text
cmd/
  └── base64.go         # base64サブコマンド（encode/decode両対応、1ファイルに集約）
internal/
  └── base64util.go     # base64共通処理（エンコード・デコードロジック）
  └── base64util_test.go # 共通処理の単体テスト
main.go                 # CLIエントリポイント
Makefile                # ビルド・テスト・フォーマット・リンター管理
bin/                    # バイナリ出力先
```

**Structure Decision**:
- サブコマンドはcmd/base64.goに1ファイルで実装
- 共通処理はinternal/base64util.goに分離
- テストはinternal/base64util_test.go等でTDDサイクルを担保
- Makefileで全ビルド・テスト・フォーマット・リンターを管理
- バイナリはbin/配下に出力

## Complexity Tracking


現時点で憲法違反・複雑性の追加はありません。
