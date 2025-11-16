# Spec Kit SUMMARY

## Spec Kitによる開発の進め方

Spec Kitは、新規開発や既存開発に使用できる。
どちらも導入の流れは以下の通り。

1. Spec Kitが必要とするファイル群をインストールする
2. `Constitution`コマンドを実行する
3. `Specify`コマンドを実行する
4. `Plan`コマンドを実行する
5. `Tasks`コマンドを実行する
6. `Implement`コマンドを実行する

以降は、 3. 〜 6. を繰り返して開発を進める。 

### Spec Kitが必要とするファイル群をインストールする

以下のファイル群をインストールする必要がある。

```
├── .github
│   ├── agents
│   ├── prompts
│
├── .specify
│   ├── memory
│   ├── scripts
│   └── templates
│
├── .vscode
```

新規開発の場合は、以下のように新規プロジェクトを作成する。

```
specify init <project name>
```

> git のデフォルトのブランチ名が `master` のため、 任意で `main` にリネームする

既存開発の場合は、既存プロジェクトのディレクトリに移動し、以下のように必要なファイルを追加する。

```
specify init --here
```

> **上書き**の確認あり

準備ができたら、プロジェクトのディレクトリに移動して`code .`など、使用しているIDEを起動する。

> 任意でSpec Kitのファイル群の変更前の状態をコミットして残した方が後々変更箇所の確認が容易になる

### `Constitution`コマンドを実行する

このコマンド実行で定める憲法がSpec Kitを用いた仕様駆動開発の中で一番重要。
git repoの中で開発するソフトウェアの概要・特徴・開発方針などを定める。

**CLIの場合:**
```
/constitution 開発するソフトウェアの概要・特徴・開発方針などを書く
```

**vscodeの場合:**
```
/speckit.constitution 開発するソフトウェアの概要・特徴・開発方針などを書く
```

コマンド実行で、以下の`.specify/memory/constitution.md`ファイルが更新される。

`constitution.md`をレビュー/編集し、全体の方針を決める。
> 何度も言うが、このファイルが一番重要。全体の生成結果に大きく影響する。

> 最初のうちは、`constitution.md`の更新がされなかったことが頻繁にあったが原因は不明。

この後の`Specify`コマンドから、プルリクエスト単位くらいの粒度の要件/仕様を定めていく流れとなる。

### `Specify`コマンドを実行する

このコマンド実行で開発する要件（何を作るのか）を定める。コマンドを実行するとブランチが自動的に作成される。

**CLIの場合:**
```
/specify 何を作るのかを書く
```

**vscodeの場合:**
```
/speckit.specify 何を作るのかを書く
```

コマンド実行で、以下の`specs/<branch-name>/spec.md`ファイルが作成される。

`spec.md`をレビュー/編集し、要件を整理する。

> 最初のうちは、specs以下のファイルが作成されなかったが頻繁にあったが原因は不明。

曖昧な要件をクリアにすると、このフェーズは終了になる。

> `Clarify specification requirements`などの提案があるので、必要に応じて依頼する。

### `Plan`コマンドを実行する

このコマンド実行で開発する仕様（どうやって作るのか）を定める。

**CLIの場合:**
```
/plan どうやって作るのかを書く
```

**vscodeの場合:**
```
/speckit.plan どうやって作るのかを書く
```

コマンド実行で、以下の`specs/<branch-name>/plan.md`ファイルが作成される。

`plan.md`をレビュー/編集し、要件を整理する。
曖昧な仕様をクリアにすると、このフェーズは終了になる。

### `Tasks`コマンドを実行する

このコマンド実行で開発する仕様からタスク分割を行う。

**CLIの場合:**
```
/tasks
```

**vscodeの場合:**
```
/speckit.tasks
```

コマンド実行で、以下の`specs/<branch-name>/tasks.md`ファイルが作成される。

`tasks.md`をレビュー/編集し、タスクを整理する。
タスクの整理が完了すると、このフェーズは終了になる。

### `Implement`コマンドを実行する

このコマンド実行でこれまで練った仕様に沿って実装を開始する。

**CLIの場合:**
```
/implement
```

**vscodeの場合:**
```
/speckit.implement
```

---

以上、納得がいく結果ができたら、結果をコミット/リモートにプッシュしてプルリクエストを作成する流れ、つまりは一般的な開発の流れとなる。

## 仕様駆動開発の実践 - GO CLIの開発

goでCLI開発を実際に行っていく。
今回、実施した内容は以下の通り。
- **[Specify1]** goを用いたCLIプロジェクトのセットアップ
- **[Specify2]** base64サブコマンドの追加

### 評価した環境

- **OS**: macOS tahoe 26.1
- **Tools**:
  - Homebrew 5.0.1
  - npm 11.6.2 / node v25.2.0
  - Python 3.13.5
  - uv 0.9.9 (Homebrew 2025-11-12)
  - GitHub CLI 2.83.1 (2025-11-13)
  - GitHub Copilot GPT-4.1 model
  - GitHub Copilot CLI 0.0.358 
  - GitHub Spec Kit - Specify CLI 0.0.22 / Template Version 0.0.85
  - vscode 1.106.0
  - go 1.25.4
  - golangci-lint 2.6.2
  - GNU Make 3.81
  - cobra-cli@latest
  - cobra@latest
  - viper@latest

> **GOPATH設定**
>
>  export GOPATH=$(go env GOPATH)<br>export PATH="$GOPATH/bin:$PATH"

> **uvのインストール先のパス設定:**
>
> export PATH="~/.local/bin:$PATH"

### constitution

```text
/speckit.constitution
cobraとviperを利用したCLIの開発を対象とし、コード品質、テスト基準、ユーザーエクスペリエンスの一貫性、パフォーマンス要件、テスト駆動開発に焦点を当てたconstitutionを設定する。日本語を利用する。
go 1.25、cobra@latest、viper@latestを利用し、CLIの設定管理はviperを利用する。
フォーマッターはgofmt、リンターはgovetを利用するがgolangci-Lintからgovetのみ有効化して利用する。
ビルドはMakefileを利用する。Makefileには、.PHONYも宮言する。
実装の際は、追加したモジュールに対する単体テストコードを用意し、テスト、フォーマッター、リンターをバスすること。
.githubディレクトリが存在するバスが、プロジェクトルートであり、goのソースコードのルートになる。
メイン処理は、main.goとする。
非公開にしたい内部モジュールはinternalパッケージ以下に配置する。
単体テストコードは実装コードと同じパッケージに配置する。
パイナリのビルド先はbinとする。
```

### 001-cobra-viper-cli-setup

#### specify

```
/speckit.specify
cobraとviperを用いたgoの標準的なディレクトリ構成のプロジェクトを実装する。
CLIはlinux,macos,windowsをターゲットとする。GUIは除外する。
プロジェクトのビルドは、Makefileを利用して行う。Makefileには、all, build, test, fmt, lint, clean(binディレクトリを削除)のルールを作成する。
goに適した.gitignore, README.mdとLICENSEファイルを用意する。
gomodを利用してcobra,Cobra-cli,viperをインストールする。
viperを有効、ライセンスはapacheでcobra-cliで初期化する。
CIのGitHub Actionsを作成する。
将来的には、GoReleaserとGitHub Actionsを利用してリリースを自動化し、homebrewからインストールできるようにする。
```

#### plan

```
/speckit.plan
Go Moduleの初期化を行い、cobra-cli, cobra, viperをインストールする。
cobra-cliを用いてviperを有効とライセンスはapacheで初期設定する。
help や version は、cobraの標準機能で自動提供される前提とする。
CLI名はグローバルな定数として営言し、値は　mycli とする。
CLI名はパージョンは定数として空言し、値は　dev とする。パージョンはリリースのタイミングで適切なパージョンに置き換える運用とする。
CLIの設定ファイルは、YAML形式。
CLIの設定ファイル名は、mycli.yml。
ホームディレクトリは、OSに適したパスを用いる。
CLIの設定ファイル名のバスはホームディレクトリをベースに、`/`, `/.config`, `/.config/mycli` とする。
```

---

このSpecifyの結果は、以下の通り。

https://github.com/rising3/speckit-tutorial/commit/4db9f381bdb6005f72854db9e9fb94ada1ebecab

### 001-base64-subcommand

新しいチャットを開くのを、お忘れなく。

#### specify

```
/speckit.specify
cobra-cliを使用してbase64サブコマンドを追加実装する。
base64サブコマンドは、エンコードとデコードをサポートする。
```

#### plan

```
/speckit.plan
エンコードは、 mycli base64 encode {text} と実行することで {text} をエンコーディングした結果を標準出力にする。
また {text} は標準入力、パイプ、リダイレクトからも入力できる。
デコードは、mycli base64 decode {b64text} と実行することで {b64text} をデコーディングした結果を標準出力にする。
また {b64text} は標準入力、パイプ、リダイレクトからも入力できる。
base64の共通化できる処理は、共通モジュールとしてinternal配下に配置する。
base64サプコマンドの追加したモジュールに対する単体テストコードを用意し、テスト、フォーマッター、リンターがバスすること。
cmdディレクトリ内のこの追加実装は1ファイルにまとめる。
```

---

このSpecifyの結果は、以下の通り。

https://github.com/rising3/speckit-tutorial/commit/0de0e3c4277302d4487b20664e531c4fbafb0064

## 最後に


ネットの情報を参考にしながら進めたが、Spec Kitを用いた開発に習熟するまでには相応の時間を要した。この使い方が正しいかどうかは正解が不明であり、答え合わせもできないため、ここで紹介した内容の正確性は保証できない。参考情報として受け止められたい。

最近は `.github/copilot-instructions.md` やVibe Codingなどのツールも、習熟すれば生産性向上が期待できる。現時点では仕様駆動開発と比較して明確な優劣はつけがたい。

仕様駆動開発では、要求単位でブランチを切り、仕様の深掘りや曖昧な要求の整理を経て実装に進む流れとなる。この流れが洗練されれば、従来の開発スタイルに大きな変化をもたらす可能性があり、AIエージェントと協調して開発を行う世界の一端を垣間見ることができる。ただし、現状ではエンジニアが関与する範囲は限定的であり、AIエージェントが実装の全てを担うには至っていない。

仕様駆動開発は、まだ発展途上の技術であり課題も多いが、AIエージェントを活用した開発のデファクトスタンダードとなることが期待できる。
