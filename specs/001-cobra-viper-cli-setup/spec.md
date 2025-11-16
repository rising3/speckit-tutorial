# 雛形の再生成・削除・バージョン管理（clarify結果）
雛形の再生成・削除手順や雛形自体のバージョン管理（バージョン番号や更新履歴等）は、README等に特に明記しません。
# 雛形生成後の運用・拡張ガイド（clarify結果）
雛形にはREADMEや主要ファイルのコメント等で、
- main.goの編集方法
- internal配下の追加・設計指針
- Makefileの拡張例
- テスト追加・TDDサイクルの推奨
など、カスタマイズ・運用ガイドも明記します。
これにより、雛形利用者がスムーズに独自CLI開発・運用を開始できるよう配慮します。
# セキュリティ要件（clarify結果）
雛形には特別なセキュリティ対策（gosec等）や脆弱性チェック、秘密情報検出、依存ライブラリの自動脆弱性監査等は含めません。
Go/Cobra/Viper/CIの標準的なセキュリティのみを前提とします。
# エラーハンドリング方針（clarify結果）
雛形生成後の「make build/test/fmt/lint」や「CI実行」等で失敗した場合は、Go/Cobra/Viper/Makefile/CIの標準エラー出力のみを利用します。
追加の独自エラーメッセージや通知雛形は含めません。
# スコープ外（clarify結果）
本CLI雛形は、以下の機能・領域は一切含みません：
- APIサーバー
- Webアプリケーション
- データベースアクセス
- GUI（グラフィカルユーザーインターフェース）
- 外部サービス連携（例: Slack通知、メール送信等）
あくまで「Go製CLIアプリ雛形」のみを対象とします。


# Feature Specification: cobraとviperを用いたGo CLIプロジェクトの標準構成

## ユーザー定義（clarify結果）
本仕様における「ユーザー」は、以下すべてを含む：
- Go CLI開発者（雛形利用者）
- CI運用者（CI/CDや自動リリースの運用担当）
- 最終CLI利用者（生成されたCLIバイナリの利用者）

この定義に基づき、以降の要件・受け入れ基準・エッジケースを解釈・拡張すること。

**Feature Branch**: `001-cobra-viper-cli-setup`
**Created**: 2025-11-16
**Status**: Draft
**Input**: User description: "cobraとviperを用いたgoの標準的なディレクトリ構成のプロジェクトを実装する。CLIはlinux,macos,windowsをターゲットとする。GUIは除外する。プロジェクトのビルドは、Makefileを利用して行う。Makefileには、all, build, test, fmt, lint, clean(binディレクトリを削除)のルールを作成する。goに適した.gitignore, README.mdとLICENSEファイルを用意する。gomodを利用してcobra,Cobra-cli,viperをインストールする。viperを有効、ライセンスはapacheでcobra-cliで初期化する。CIのGitHub Actionsを作成する。将来的には、GoReleaserとGitHub Actionsを利用してリリースを自動化し、homebrewからインストールできるようにする。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - CLIプロジェクトの雛形を作成できる (Priority: P1)

ユーザーは、Goの標準的なディレクトリ構成・cobra/viper初期化済み・Makefile/CI/README/ライセンス付きのCLIプロジェクト雛形をコマンド一発で作成できる。

**Why this priority**: 開発者がすぐにクロスプラットフォームCLI開発を始められる価値が最も高いため。

**Independent Test**: 雛形生成後、全ビルド・テスト・フォーマット・リンター・CIがパスし、README/ライセンス/CIファイルが存在することを確認。

**Acceptance Scenarios**:
1. **Given** プロジェクト初期状態、**When** 雛形生成コマンドを実行、**Then** 標準構成・依存・Makefile・CI・README・LICENSEが揃う
2. **Given** 雛形生成後、**When** make allを実行、**Then** build/test/fmt/lintが全て成功する

---

### User Story 2 - クロスプラットフォーム対応 (Priority: P2)

ユーザーは、Linux/macOS/Windowsいずれの環境でもCLIをビルド・実行できる。

**Why this priority**: 幅広い開発・利用環境に対応するため。

**Independent Test**: 各OSでmake buildし、バイナリがbin/配下に生成され、実行できることを確認。

**Acceptance Scenarios**:
1. **Given** 各OS環境、**When** make buildを実行、**Then** bin/にバイナリが生成され、実行可能

---

### User Story 3 - CIと将来の自動リリース基盤 (Priority: P3)

ユーザーは、GitHub ActionsによるCIが自動で走り、将来的にGoReleaser+Homebrew連携も容易に追加できる。

**Why this priority**: 品質担保とリリース自動化の拡張性確保のため。

**Independent Test**: PR作成時にCIが自動実行され、GoReleaser/リリース自動化のための雛形ファイルが存在することを確認。

**Acceptance Scenarios**:
1. **Given** PR作成時、**When** push/PRをトリガー、**Then** GitHub ActionsでCIが自動実行される
2. **Given** GoReleaser雛形、**When** 設定追加、**Then** Homebrew配布も容易に拡張できる

---

### Edge Cases
- Windows環境でのパス区切りやバイナリ名の違い
- viper設定ファイルの有無・パス指定ミス時の挙動
- Makefileのターゲット未定義時のエラー
- CI環境での依存解決失敗

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
- .gitignore, README.md, LICENSE（Apache）を用意すること
- gomodで依存管理し、cobra/cobra-cli/viperをインストールすること
- GitHub ActionsでCIを構成すること
- GoReleaser/自動リリース雛形を用意すること

上記に違反する場合は、必ず理由・代替案を明記すること。

### Key Entities
- **プロジェクト雛形**: 標準ディレクトリ構成、依存、Makefile、CI、README、LICENSE
- **ビルド成果物**: bin/配下のバイナリ
- **CI/CD構成**: .github/workflows/配下のCIファイル、GoReleaser雛形

## Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC-001**: make allで全ターゲット（build/test/fmt/lint）が成功する
- **SC-002**: Linux/macOS/Windowsでバイナリが生成・実行できる
- **SC-003**: PR作成時にCIが自動実行され、全ジョブが成功する
- **SC-004**: README/ライセンス/CI/GoReleaser雛形が揃っている
- **SC-005**: viper設定ファイルの有無・パス指定ミス時もエラーが分かりやすい
