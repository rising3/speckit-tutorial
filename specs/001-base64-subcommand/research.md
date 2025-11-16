# research.md: base64サブコマンド追加

## Decision 1: 標準入力と引数の優先順位
- **Decision**: 標準入力が存在する場合は標準入力を優先し、なければ引数を利用する。
- **Rationale**: UNIX系CLIの慣習に従い、パイプやリダイレクト利用時の直感的な動作を重視。
- **Alternatives considered**:
  - 引数優先: 明示性は高いが、パイプ利用時の一貫性に欠ける。
  - 両方指定時はエラー: 利用者体験が悪化するため不採用。

## Decision 2: 共通処理のinternal分離
- **Decision**: base64のエンコード・デコード処理はinternal/base64util.goに共通化。
- **Rationale**: テスト容易性・再利用性・責務分離のため。
- **Alternatives considered**:
  - サブコマンド実装に直書き: テスト困難・重複発生のため不採用。

## Best Practices: Go CLI設計
- cobra/viperの最新バージョンを利用。
- サブコマンドはcmd/配下に1ファイルで集約。
- 共通ロジックはinternal/配下に分離。
- 標準入力・引数両対応はos.Stdin, os.Args, bufio.Scanner等を活用。
- 単体テストは*_test.goでTDDサイクルを厳守。
- Makefileでビルド・テスト・フォーマット・リンターを一元管理。
- バイナリはbin/配下に出力。

## Patterns: 標準入力・引数両対応
- 標準入力がパイプ/リダイレクトでデータを受け取っている場合はそれを優先。
- 何も入力がなければエラーとする。
- エラー時は明確なメッセージを標準エラー出力に返す。

---

本research.mdは仕様・設計上の意思決定と根拠、Go CLI設計のベストプラクティス、標準入力・引数両対応のパターンをまとめたものです。
