# research.md (Phase 0)

## Decision: Vite + バニラHTML/CSS/JS + SQLite (sql.js)
- Viteで高速開発・HMR・最小構成を実現
- UI/UXはバニラHTML/CSS/JSで柔軟性・軽量性を担保
- 画像ファイルはアップロードせず、ローカル参照のみ
- メタデータはsql.jsでブラウザ内SQLiteに保存

### Rationale
- Viteは現代的なWeb開発のデファクトで、依存最小・高速
- バニラJSは依存削減・保守性・パフォーマンスに優れる
- sql.jsはブラウザでSQLite互換DBを実現し、永続性・検索性・スキーマ管理が容易
- 画像アップロード禁止要件・ローカルDB要件に完全合致

### Alternatives considered
- create-react-app, Next.js, SvelteKit等: 機能過剰・依存増大のため不採用
- IndexedDB: 生SQL/スキーマ管理が煩雑、移植性・保守性でSQLite優位
- PouchDB/LocalForage等: 汎用性は高いが要件過剰
- サーバーサイドDB: オフライン・ローカル要件に合致せず

## Decision: ドラッグ&ドロップ/タイルUI
- sortablejs等の軽量ライブラリを必要最小限で利用
- CSS Grid/Flexboxでタイルレイアウト

### Rationale
- バニラJS+CSSで十分実現可能、依存を極小化
- アクセシビリティ・パフォーマンス両立

### Alternatives considered
- React DnD, Grid.js等: 重量級・依存増大のため不採用

## Decision: テスト戦略
- Vitestでユニット・ロジックテスト
- Playwright/CypressでE2E/UIテスト

### Rationale
- Vite公式推奨、セットアップ容易
- UI/UX品質担保にE2E必須

### Alternatives considered
- Jest, Mocha等: Viteとの親和性でVitest優位
- Puppeteer: Playwrightの方がモダン

## [NEEDS CLARIFICATION: なし]
