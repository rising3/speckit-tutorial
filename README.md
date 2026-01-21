# speckit-tutorial

Spec Kitのチュートリアル。GitHub Copilotのカスタム命令は使わず、Spec Kitとモデルの組み合わせだけで生成結果を評価する。

**評価モデル:**

- [GPT-4.1(0x)](https://github.com/rising3/speckit-tutorial/tree/vanilla-gpt-4_1)
- [Cluade Sonnet 4.5(1x)](https://github.com/rising3/speckit-tutorial/tree/vanilla-sonnet-4_5)

## Establish project principles

Launch your AI assistant in the project directory. The /speckit.* commands are available in the assistant.

プロジェクトディレクトリでAIアシスタントを起動してください。アシスタントでは /speckit.* コマンドが利用可能です。

Use the `/speckit.constitution` command to create your project's governing principles and development guidelines that will guide all subsequent development.

`/speckit.constitution` コマンドを使って、プロジェクトの基本原則と開発ガイドラインを作成し、以降の開発を導きます。


```
/speckit.constitution Create principles focused on code quality, testing standards, user experience consistency, and performance requirements
```

```
/speckit.constitution コード品質、テスト基準、ユーザー体験の一貫性、パフォーマンス要件に焦点を当てた原則を作成してください
```

## Create the spec

Use the `/speckit.specify` command to describe what you want to build. Focus on the what and why, not the tech stack.

`/speckit.specify` コマンドを使って、作りたいものを説明してください。技術スタックではなく「何を」「なぜ」に焦点を当ててください。

```
/speckit.specify Build an application that can help me organize my photos in separate photo albums. Albums are grouped by date and can be re-organized by dragging and dropping on the main page. Albums are never in other nested albums. Within each album, photos are previewed in a tile-like interface.
```

```
/speckit.specify 写真を個別のアルバムで整理できるアプリケーションを構築してください。アルバムは日付ごとにグループ化され、メインページでドラッグ＆ドロップによって再編成できます。アルバムは他のアルバムの中にネストされることはありません。各アルバム内では、写真がタイル状のインターフェースでプレビューされます。
```

## Create a technical implementation plan

Use the `/speckit.plan` command to provide your tech stack and architecture choices.

`/speckit.plan` コマンドを使って、技術スタックやアーキテクチャの選択肢を提示してください。

```
/speckit.plan The application uses Vite with minimal number of libraries. Use vanilla HTML, CSS, and JavaScript as much as possible. Images are not uploaded anywhere and metadata is stored in a local SQLite database.
```

```
/speckit.plan アプリケーションはViteを使用し、ライブラリ数は最小限にします。可能な限りバニラHTML、CSS、JavaScriptを使用してください。画像はどこにもアップロードされず、メタデータはローカルのSQLiteデータベースに保存されます。
```

## Break down into tasks

Use `/speckit.tasks` to create an actionable task list from your implementation plan.

`/speckit.tasks` を使って、実装計画から実行可能なタスクリストを作成してください。

```
/speckit.tasks
```

## Execute implementation

Use `/speckit.implement` to execute all tasks and build your feature according to the plan.

`/speckit.implement` を使って、すべてのタスクを実行し、計画に従って機能を構築してください。

```
/speckit.implement
```
