# quickstart.md

## セットアップ手順

1. Node.js (v18+) をインストール
2. リポジトリをクローン
3. `npm install` で依存パッケージ（Vite, sql.js, Vitest等）を導入
4. `npm run dev` でローカル開発サーバ起動
5. ブラウザで `http://localhost:5173` にアクセス

## 開発のポイント
- 画像ファイルはアップロードせず、ローカル参照のみ
- メタデータはsql.jsでブラウザ内SQLiteに保存
- UIはバニラHTML/CSS/JS＋必要最小限の軽量ライブラリ
- テストは `npm run test`（Vitest/E2E）

## 主要コマンド
- `npm run dev` ... 開発サーバ起動
- `npm run build` ... 本番ビルド
- `npm run test` ... テスト実行

## 参考
- [Vite公式](https://vitejs.dev/)
- [sql.js](https://sql.js.org/)
- [sortablejs](https://sortablejs.github.io/Sortable/)
