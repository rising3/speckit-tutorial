---
description: "Go CLI雛形（cobra/viper）実装タスク一覧"
---

# Tasks: cobraとviperを用いたGo CLI雛形

**Input**: specs/001-cobra-viper-cli-setup/spec.md, plan.md
**Prerequisites**: plan.md, spec.md, clarify内容


## Phase 1: Setup (プロジェクト初期化)

- [X] T001 Go module初期化（go mod init mycli）
- [X] T002 [P] cobra-cli, cobra, viperインストール（go install, go get, go mod tidy）
- [X] T003 [P] .gitignore作成（Go向け推奨パターン）
- [X] T004 [P] LICENSE（Apache）作成
- [X] T005 [P] README.md雛形作成
- [X] T006 Makefile雛形作成（all, build, test, fmt, lint, clean(bin削除), .PHONY明記）

---


## Phase 2: Foundational (基盤構成)

- [X] T007 main.go作成（cobra/viper初期化, CLI名/バージョン定数, help/version自動）
- [X] T008 [P] internal/ディレクトリ作成
- [X] T009 [P] bin/ディレクトリ作成
- [X] T010 [P] .github/workflows/ci.yml作成（Go, build/test/lint/fmt, PRトリガー）
- [X] T011 [P] 設定ファイルパス・YAML形式・ホームディレクトリ/OS別パス処理実装
- [X] T012 [P] go test用テスト雛形作成（main.go, internal/）

---

## Phase 3: [US1] 雛形生成・ガイド

 [X] T016 [US1] 雛形生成後、README, LICENSE, .gitignore, Makefile, main.go, internal/, bin/, .github/workflows/ci.yml, 設定ファイルが揃っていることを確認
---

## Phase 4: [US2] クロスプラットフォーム対応

- [X] T017 [US2] Linux/macOS/Windowsでmake buildし、bin/配下にバイナリが生成されることを確認
- [X] T018 [P] [US2] 設定ファイルのパス区切り・バイナリ名のOS差異をテスト
- [X] T019 [US2] viper設定ファイルの有無・パス指定ミス時の挙動をテスト

---

## Phase 5: [US3] CI/リリース自動化基盤

- [X] T020 [US3] GitHub ActionsでPR作成時にCIが自動実行されることを確認
- [X] T021 [P] [US3] GoReleaser雛形ファイル作成（.goreleaser.yml）
- [X] T022 [US3] GoReleaser雛形が将来のHomebrew配布拡張に対応できることを確認

---

## Final Phase: Polish & Cross-Cutting

- [X] T023 [P] 不要ファイル・テンプレート残骸除去
- [X] T024 [P] Makefileの.PHONY/ターゲット最終調整
- [X] T025 全体の仕様・clarify・plan・README/コメント/CI/Makefile/ディレクトリ構成の整合性最終チェック

---

## Dependencies

- Phase 1→2→3→4→5→Finalの順で段階的に進行
- [P]マークは同一Phase内で並列実行可能
- 各User Story（US1, US2, US3）は独立テスト可能

## Parallel Execution Examples

- T002, T003, T004, T005, T008, T009, T010, T011, T012, T014, T018, T021, T023, T024は他タスクと並列実行可
- US1, US2, US3はPhaseごとに独立検証可能

## Implementation Strategy

- MVPはUS1（雛形生成・ガイド・全ビルド/テスト/CIパス）
- US2, US3はMVP後に段階的追加
- すべてのタスクはTDD・フォーマット・リンター・CIパス必須
