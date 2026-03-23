"""
merge_works.py
--------------
test-tube/index.json の作品データを data/works.json にマージする。

使い方:
  python merge_works.py

前提:
  organize_animals.py を先に実行して test-tube/index.json を生成しておくこと。

動作:
  1. test-tube/index.json を読み込む
  2. 各エントリを works.json の形式に変換する
  3. 既存 works.json とマージ（id が同じなら上書き、新規なら追加）
  4. date昇順でソートして保存
"""

import json
import os
from pathlib import Path

# ── パス設定 ──────────────────────────────────────────
REPO_ROOT    = Path(__file__).parent            # このスクリプトと同じ場所 = リポジトリルート
TEST_TUBE_INDEX = REPO_ROOT / "test-tube" / "index.json"
WORKS_JSON      = REPO_ROOT / "data" / "works.json"

# test-tube の画像を works.json から参照するパス
# rootUp() + "test-tube/items/{slug}/{filename}" で解決される
IMAGE_BASE = "test-tube/items"


def convert_entry(item):
    """
    test-tube/index.json の1エントリを works.json 形式に変換する。

    test-tube/index.json 形式:
      { "slug": "thiskiss", "year": 2016, "month": 3, "date": "2016-03",
        "sourceFiles": ["2016-03-thiskiss-1.jpeg", ...],
        "folder": "items/thiskiss", "thumbnail": "items/thiskiss/2016-03-thiskiss-1.jpeg",
        "pageType": "sequence", "mediaType": "image", "count": 2 }

    works.json 形式:
      { "id": "thiskiss", "title": "thiskiss", "series": "test-tube",
        "observed": "2016-03", "tags": ["test-tube animals"],
        "thumbnail": "test-tube/items/thiskiss/2016-03-thiskiss-1.jpeg",
        "images": ["test-tube/items/thiskiss/2016-03-thiskiss-1.jpeg", ...],
        "description": "", "links": [] }
    """
    slug   = item["slug"]
    folder = item.get("folder", f"items/{slug}")  # items/thiskiss
    files  = item.get("sourceFiles", [])

    # thumbnail: test-tube/items/{slug}/{first_file}
    thumb_file = item.get("thumbnail", "").split("/")[-1] if item.get("thumbnail") else (files[0] if files else "")
    thumbnail = f"test-tube/{folder}/{thumb_file}" if thumb_file else ""

    # images: test-tube/items/{slug}/{each_file}
    images = [f"test-tube/{folder}/{f}" for f in files]

    # observed: "YYYY-MM"
    observed = item.get("date", f"{item.get('year','')}-{item.get('month', 0):02d}")

    return {
        "id":          slug,
        "title":       item.get("title", slug),
        "series":      "test-tube",
        "observed":    observed,
        "tags":        ["test-tube animals"],
        "thumbnail":   thumbnail,
        "images":      images,
        "description": "",
        "links":       [],
    }


def main():
    # ── test-tube/index.json 読み込み ──
    if not TEST_TUBE_INDEX.exists():
        print(f"ERROR: {TEST_TUBE_INDEX} が見つかりません。")
        print("先に organize_animals.py を実行してください。")
        return

    new_items = json.loads(TEST_TUBE_INDEX.read_text(encoding="utf-8"))
    print(f"test-tube/index.json: {len(new_items)} 作品")

    # ── 既存 works.json 読み込み ──
    existing = []
    if WORKS_JSON.exists():
        existing = json.loads(WORKS_JSON.read_text(encoding="utf-8"))
        print(f"data/works.json (既存): {len(existing)} 作品")

    # id → entry の辞書
    work_map = {w["id"]: w for w in existing}

    # ── マージ ──
    added   = 0
    updated = 0
    for item in new_items:
        converted = convert_entry(item)
        wid = converted["id"]
        if wid in work_map:
            # 既存エントリに thumbnail / images / observed だけ上書き
            # tags / description / links は手動管理を尊重して維持
            old = work_map[wid]
            old["thumbnail"] = converted["thumbnail"]
            old["images"]    = converted["images"]
            old["observed"]  = converted["observed"]
            updated += 1
        else:
            work_map[wid] = converted
            added += 1

    # ── date昇順ソート ──
    merged = sorted(work_map.values(),
                    key=lambda w: w.get("observed", ""))

    # ── 保存 ──
    WORKS_JSON.write_text(
        json.dumps(merged, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    print(f"\n完了:")
    print(f"  追加: {added} 作品")
    print(f"  更新: {updated} 作品（thumbnail/images/observed を上書き）")
    print(f"  合計: {len(merged)} 作品 → data/works.json に保存")
    print(f"\n次のステップ:")
    print(f"  data/works.json を GitHub にコミット・プッシュしてください。")


if __name__ == "__main__":
    main()
