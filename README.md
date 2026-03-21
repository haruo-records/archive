# haruo records — 更新・運用ガイド

## ディレクトリ構成

```
portal/
├── index.html               トップページ（作品一覧 + タグ絞り込み + 外部リンク）
├── works/
│   ├── index.html           作品一覧専用ページ
│   └── work.html            個別作品ページ（?id=xxx で切替）
├── img/                     新規画像の置き場（今後ここに追加）
├── data/
│   └── works.json           ★ 作品追加はここだけ編集すればOK ★
├── assets/
│   ├── style.css            全ページ共通スタイル
│   └── app.js               全ページ共通JS
└── animals/                 既存ファイル（画像を保持するため残す）
    └── test-tube/
        └── voltfoot/
            └── images/
                ├── voltfoot_199804_01.png
                └── voltfoot_199804_02.png
```

---

## 新しい作品を1件追加する手順

### ステップ1 — 画像を追加

`img/` フォルダに画像ファイルをアップロードする。

- **推奨形式:** PNG / JPEG / WebP
- **推奨サイズ:** 横1200px以内
- **命名例:** `sandtail_200306_01.png`（`作品名_年月_連番`）

### ステップ2 — works.json を編集

`data/works.json` の配列の末尾に、カンマ区切りで新しいオブジェクトを追加する。

```json
[
  ...（既存の作品）,
  {
    "id": "sandtail",
    "title": "sandtail",
    "series": "test-tube",
    "observed": "2003-06",
    "tags": [
      "test-tube animals",
      "speculative biology",
      "abstract organism",
      "emergence"
    ],
    "thumbnail": "/portal/img/sandtail_200306_01.png",
    "images": [
      "/portal/img/sandtail_200306_01.png",
      "/portal/img/sandtail_200306_02.png"
    ],
    "description": "",
    "links": []
  }
]
```

### ステップ3 — コミット・プッシュ

GitHubにプッシュすれば数分で反映される。

---

## フィールド一覧

| フィールド    | 必須 | 説明 |
|------------|:----:|------|
| `id`       | ✅   | URL用の一意なID（英数字・ハイフン）。`works/work.html?id=xxx` に使われる |
| `title`    | ✅   | 作品名 |
| `series`   |      | シリーズ名（例: `"test-tube"`） |
| `observed` |      | 観察日。`"YYYY-MM"` 形式。一覧の並び順に使われる |
| `tags`     | ✅   | タグの配列。絞り込みフィルターに使われる |
| `thumbnail`| ✅   | 一覧カードのサムネイル画像パス |
| `images`   |      | 個別ページで表示する画像パスの配列（複数可） |
| `description` |   | 作品説明文（空文字 `""` でもOK） |
| `links`    |      | 外部リンクの配列（YouTube・noteなど）。後から追加可 |

### links フィールドの例

```json
"links": [
  { "label": "YouTube", "url": "https://www.youtube.com/watch?v=xxxxx" },
  { "label": "note",    "url": "https://note.com/xxxxx" },
  { "label": "購入ページ", "url": "https://..." }
]
```

---

## iPhoneからの更新方法

**Working Copy**（iOS無料アプリ）または **GitHub公式アプリ** を使う。

1. リポジトリをクローン（初回のみ）
2. `img/` に画像をアップロード
3. `data/works.json` を開いて末尾に1オブジェクト追加
4. コミット → プッシュ → 完了

---

## タグ運用の推奨

一覧フィルターに表示されるため、表記を統一しておくと使いやすい。

```
シリーズ:    test-tube animals / field animals
概念:        conceptual art / generative art / speculative biology
形質:        abstract organism / posthuman / emergence / mutation
性質:        liminality / observed not explained / cosmic-colored animals
```

---

## 既存コンテンツとの関係

- `animals/test-tube/voltfoot/images/` の画像は `works.json` から直接パス指定で参照している
- 旧 `animals/*/index.html` は削除してよい（works.json に情報を集約済み）
- 画像ファイル自体は移動不要

---

## 変更ファイル一覧（旧→新）

| 操作 | ファイル |
|------|---------|
| 置き換え | `index.html` |
| 新規 | `works/index.html` |
| 新規 | `works/work.html` |
| 新規 | `data/works.json` |
| 新規 | `assets/style.css` |
| 新規 | `assets/app.js` |
| 新規 | `README.md` |
| 削除推奨 | `animals/index.html` |
| 削除推奨 | `animals/test-tube/index.html` |
| 削除推奨 | `animals/test-tube/voltfoot/index.html` |
| 保持 | `animals/test-tube/voltfoot/images/*.png` |
