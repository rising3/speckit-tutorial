# Tasks: base64サブコマンド追加

## Phase 1: Setup
- [X] T001 プロジェクト依存パッケージcobra/viperのバージョン確認・導入（go.mod, go.sum）
- [X] T002 Makefileにbuild/test/fmt/lint/.PHONYを追加・整備

## Phase 2: Foundational
- [X] T003 internal/base64util.goの雛形作成
- [X] T004 internal/base64util_test.goの雛形作成

## Phase 3: [US1] base64エンコード
- [X] T005 [US1] cmd/base64.goにencodeサブコマンド実装（標準入力・引数両対応、標準入力優先）
- [X] T006 [P] [US1] internal/base64util.goにエンコード関数実装
- [X] T007 [P] [US1] internal/base64util_test.goにエンコード関数の単体テスト追加

## Phase 4: [US2] base64デコード
- [X] T008 [US2] cmd/base64.goにdecodeサブコマンド実装（標準入力・引数両対応、標準入力優先）
- [X] T009 [P] [US2] internal/base64util.goにデコード関数実装
- [X] T010 [P] [US2] internal/base64util_test.goにデコード関数の単体テスト追加

## Phase 5: [US3] 標準入力対応
- [X] T011 [US3] cmd/base64.goで標準入力・引数の優先順位ロジック実装
- [ ] T012 [US3] 標準入力・引数両対応の統合テスト（internal/base64util_test.goまたは新規ファイル）

## Phase 6: Polish & Cross-Cutting
- [ ] T013 CLI応答パフォーマンス検証（10秒以内で出力されることを確認）
- [ ] T014 gofmt/golangci-lint（govet）/make testが全てパスすることを確認
- [ ] T015 bin/配下にバイナリが正しく出力されることを確認

## Dependencies
- US1→US2→US3の順で独立テスト可能
- internal/base64util.go, internal/base64util_test.goは全フェーズで並列実装可

## Parallel Execution Examples
- T006, T007, T009, T010は並列実行可能（異なる関数・テスト）

## Implementation Strategy
- MVPはUS1（エンコードのみ）で成立。まずT005, T006, T007で最小CLIを完成させ、以降incremental delivery。

---

- 合計タスク数: 15
- US1: 3, US2: 3, US3: 2
- 並列実行可能タスク: 4
- 各ストーリーは独立テスト基準あり
- MVPスコープ: US1（T005, T006, T007）
- 全タスクがチェックリスト形式・ファイルパス明記
