# data-model.md

## エンティティ定義

### Album（アルバム）
- id: string (UUID)
- title: string
- date: string (YYYY-MM-DD)
- order: number
- photos: Photo[]

### Photo（写真）
- id: string (UUID)
- filePath: string（ローカルファイルパス）
- thumbnail: string（Base64またはBlob URL）
- date: string (YYYY-MM-DD)
- albumId: string
- metadata: {
    name: string,
    size: number,
    type: string,
    createdAt: string,
    [その他EXIF等]
  }

## リレーション
- Album 1 --- * Photo（albumIdで紐付け）
- アルバムは入れ子不可（フラット構造）

## バリデーション
- title: 1〜50文字、重複不可
- date: ISO8601形式
- filePath: 存在チェック
- order: 0以上の整数
- 写真数: 0〜1000枚/アルバム（目安）

## 状態遷移（主要操作）
- アルバム作成 → 写真追加/削除 → 並べ替え → アルバム削除
- 写真追加 → サムネ生成 → メタデータ抽出 → DB保存
- 並べ替え → order更新

## 備考
- 画像ファイル自体はDBに保存せず、ローカル参照のみ
- メタデータのみSQLite（sql.js）に永続化
