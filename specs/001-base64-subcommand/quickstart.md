# Quickstart: base64サブコマンド追加

## 1. ビルド
```sh
make build
```

## 2. エンコード例
```sh
./bin/mycli base64 encode "hello"
# => aGVsbG8=

echo "hello" | ./bin/mycli base64 encode
# => aGVsbG8=
```

## 3. デコード例
```sh
./bin/mycli base64 decode "aGVsbG8="
# => hello

echo "aGVsbG8=" | ./bin/mycli base64 decode
# => hello
```

## 4. テスト・フォーマット・リンター
```sh
make test
make fmt
make lint
```

## 5. 仕様・設計
- [spec.md](./spec.md)
- [plan.md](./plan.md)
- [data-model.md](./data-model.md)
- [contracts/openapi-base64.yaml](./contracts/openapi-base64.yaml)
- [research.md](./research.md)

---

本quickstart.mdは、base64サブコマンドのビルド・利用・テスト・設計参照の手順をまとめたものです。
