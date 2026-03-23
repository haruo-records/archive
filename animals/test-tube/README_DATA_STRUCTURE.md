# animals test-tube — データ構造

このフォルダは `animals_rawdata` を元に生成したサイト用データです。

## 概要
- 元画像は変更・移動していません（コピーのみ）
- `items/` 配下に作品ごとのフォルダがあります
- 各フォルダに画像と `meta.json` が入っています
- `index.json` に全作品の一覧があります

## 命名規則
```
YYYY-MM-作品名.ext          # 単体作品
YYYY-MM-作品名-番号.ext     # 連番作品（同一作品としてまとめられます）
```

## 新規作品の追加手順
1. `animals_rawdata` に上記命名規則でファイルを置く
2. `organize_animals.py` を再実行する
3. `test-tube/` が自動で更新されます

## ファイル構造
```
test-tube/
  index.json              ← 全作品一覧（サイト側で読み込む）
  items/
    作品名/
      画像ファイル
      meta.json           ← 作品メタデータ
  report.txt              ← 処理レポート
  README_DATA_STRUCTURE.md
```

## サイトへの組み込み
- `index.json` を fetch して作品一覧を表示
- 各作品の `folder` + `meta.json` を参照して詳細ページを生成
- `thumbnail` フィールドがサムネイル画像パス
