# data-model.md: base64サブコマンド追加

## Entity: Base64Command
- name: string ("base64")
- mode: string ("encode" or "decode")
- input: string (標準入力または引数)
- output: string (標準出力)
- error: string (エラー時のみ)

### Validation Rules
- modeは必ず"encode"または"decode"であること
- 入力が空の場合は出力も空
- 不正なbase64文字列はエラーとする

### State Transitions
- 入力受付 → エンコード/デコード処理 → 出力/エラー

---

## Relationships
- Base64CommandはCLIのサブコマンドとしてcmd/に1ファイルで実装
- 共通処理はinternal/base64util.goで管理

---

本data-model.mdはCLIサブコマンドのエンティティ設計・バリデーション・状態遷移・責務分離を明示します。
