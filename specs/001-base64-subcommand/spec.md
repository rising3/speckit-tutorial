
# Feature Specification: base64サブコマンド追加

**Feature Branch**: `001-base64-subcommand`
**Created**: 2025-11-16
**Status**: Draft
**Input**: User description: "cobra-cliを使用してbase64サブコマンドを追加実装する。base64サブコマンドは、エンコードとデコードをサポートする。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - base64エンコード (Priority: P1)

ユーザーはCLIからbase64サブコマンドを使い、任意の文字列をbase64エンコードできる。

**Why this priority**: CLIの主目的の一つであり、最も基本的な利用シナリオのため。

**Independent Test**: CLIで `mycli base64 encode "test"` を実行し、正しいbase64文字列が出力されることを確認する。

**Acceptance Scenarios**:

1. **Given** CLIがインストールされている, **When** `mycli base64 encode "hello"` を実行, **Then** "aGVsbG8=" が出力される
2. **Given** 空文字列, **When** `mycli base64 encode ""` を実行, **Then** 空文字列が出力される

---

### User Story 2 - base64デコード (Priority: P2)

ユーザーはCLIからbase64サブコマンドを使い、base64エンコードされた文字列をデコードできる。

**Why this priority**: エンコードと並ぶ主要機能であり、双方向性が求められるため。

**Independent Test**: CLIで `mycli base64 decode "aGVsbG8="` を実行し、"hello"が出力されることを確認する。

**Acceptance Scenarios**:

1. **Given** CLIがインストールされている, **When** `mycli base64 decode "aGVsbG8="` を実行, **Then** "hello" が出力される
2. **Given** 不正なbase64文字列, **When** `mycli base64 decode "@@@"` を実行, **Then** エラーメッセージが表示される

---

### User Story 3 - 標準入力対応 (Priority: P3)

ユーザーはパイプやリダイレクトで標準入力からデータを受け取り、base64エンコード・デコードできる。

**Why this priority**: CLIツールとしての柔軟性・実用性向上のため。

**Independent Test**: `echo "hello" | mycli base64 encode` で正しいbase64文字列が出力されることを確認する。

**Acceptance Scenarios**:

1. **Given** 標準入力にデータがある, **When** `mycli base64 encode` を実行, **Then** 入力データがbase64エンコードされて出力される
2. **Given** 標準入力にデータがある, **When** `mycli base64 decode` を実行, **Then** 入力データがデコードされて出力される

---

### Edge Cases

- 入力が空の場合、出力も空となる
- 不正なbase64文字列の場合、明確なエラーメッセージを返す
- 標準入力と引数が同時に指定された場合は、標準入力を優先する（UNIX系CLIの慣習に従う）

## Requirements *(mandatory)*

### CLI憲法に基づく必須要件

- Go 1.25、cobra@latest、viper@latestを利用すること
- main.goをエントリポイントとし、internalパッケージで内部実装を分離すること
- 設定管理はviperで一元化すること
- gofmtで整形、golangci-lint（govetのみ）で静的解析をパスすること
- Makefileでビルド・テスト・フォーマット・リンター・.PHONY管理を徹底すること
- バイナリはbin/配下に出力すること
- すべての新規・追加モジュールに単体テストがあり、TDDサイクルを守ること
- CLIの応答・体感パフォーマンスに問題がないこと

上記に違反する場合は、必ず理由・代替案を明記すること。

### Key Entities *(include if feature involves data)*

- **Base64Command**: サブコマンド名、モード（encode/decode）、入力データ、出力データ、エラー情報

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: ユーザーがbase64エンコード/デコードをCLIから10秒以内に完了できる
- **SC-002**: 不正な入力時に100%エラーメッセージが表示される
- **SC-003**: 標準入力・引数どちらでも正しく動作し、95%以上のケースで期待通りの出力となる
- **SC-004**: 主要ユースケースの単体テストカバレッジが90%以上
