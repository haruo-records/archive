/*
  animals — haruo records
  shared utilities v4
*/

/* ── works.json fetch ──
 *
 * GitHub Pages project site では URL に /archive/ プレフィックスが付く:
 *   https://haruo-records.github.io/archive/
 *   https://haruo-records.github.io/archive/archive/
 *
 * data/works.json は常に「サイトのルートディレクトリ（=リポジトリルート）」にある。
 * つまり /archive/data/works.json に相当する。
 *
 * どのページからでも確実に解決するため、
 * 「このページのディレクトリ」から「リポジトリルート」への相対パスを計算する。
 *
 * アルゴリズム:
 *   1. location.pathname からディレクトリ部分を取り出す
 *   2. そこから "1段目（リポジトリ名）" を除いたページ固有の深さを数える
 *   3. その分だけ ../ で上がると /archive/ に戻れる
 *   4. そこから data/works.json を参照する
 *
 * 例:
 *   /archive/         → parts=[] depth=0 → fetch("data/works.json")
 *   /archive/archive/   → parts=['archive'] depth=1 → fetch("../data/works.json")
 *   /archive/archive/work.html → 同上
 */
async function fetchWorks() {
  // ディレクトリ部分のみ取り出す（末尾のファイル名を除去）
  const dir = location.pathname.replace(/\/[^\/]*$/, ''); // 例: /archive/archive
  // / で分割して空文字と先頭のリポジトリ名('archive')を除いたページ固有部分
  const segments = dir.split('/').filter(Boolean); // 例: ['archive', 'archive']
  // segments[0] がリポジトリ名なので除外、残りが実際の階層深さ
  const depth = Math.max(0, segments.length - 1);  // 例: 1
  const up = depth > 0 ? '../'.repeat(depth) : '';  // 例: '../'
  const url = up + 'data/works.json';               // 例: '../data/works.json'
  const res = await fetch(url);
  if (!res.ok) throw new Error('fetchWorks failed: HTTP ' + res.status + ' for ' + url);
  return res.json();
}

/* ── fetchAllWorks ──
 *
 * データソース（優先順位順）:
 *   1. animals/test-tube/index.json  — organize_animals.py の出力物（過去作品群）
 *   2. data/works.json               — 手動管理分（voltfoot など）
 *
 * どちらか一方しかなくても動作する。
 * id が重複した場合は data/works.json を優先（手動管理側が上書き）。
 *
 * パス基準:
 *   organize_animals.py は Github_Site/animals/test-tube/ に出力する。
 *   GitHub Pages では /archive/animals/test-tube/ に対応する。
 *   画像パスも animals/test-tube/items/<slug>/<file> で解決する。
 */
async function fetchAllWorks() {
  const dir  = location.pathname.replace(/\/[^\/]*$/, '');
  const segs = dir.split('/').filter(Boolean);
  const depth = Math.max(0, segs.length - 1);
  const up   = depth > 0 ? '../'.repeat(depth) : '';

  // 1. animals/test-tube/index.json（organize_animals.py 生成 — 過去作品群）
  let testtube = [];
  try {
    const r = await fetch(up + 'animals/test-tube/index.json');
    if (r.ok) {
      const raw = await r.json();
      testtube = raw.map(item => {
        const slug   = item.slug;
        const folder = item.folder || ('items/' + slug);  // "items/slug"
        const base   = 'animals/test-tube/' + folder + '/'; // 画像フォルダの基準パス

        // sourceFiles: organize_animals.py が生成する全画像リスト
        // 旧版の index.json には含まれていない場合があるため以下でフォールバック
        let files = item.sourceFiles || [];

        // sourceFiles がない場合: thumbnail のファイル名を1件セットにする
        if (!files.length && item.thumbnail) {
          files = [ item.thumbnail.split('/').pop() ];
        }

        // thumbnail: index.json の thumbnail フィールドからファイル名だけ取得
        const thumbFile = (item.thumbnail || '').split('/').pop() || (files[0] || '');

        // 画像パスはすべて base + filename の形式
        // rootUp() が呼び出し元で付加されるため、ここではリポジトリルート相対のまま
        return {
          id:          slug,
          title:       item.title || slug,
          series:      'test-tube',
          observed:    item.date || '',
          tags:        item.tags || ['test-tube animals'],
          thumbnail:   thumbFile ? (base + thumbFile) : '',
          images:      files.map(f => base + f),        // ← 全画像を展開
          description: item.description || '',
          links:       item.links || [],
          pageType:    item.pageType || 'single',
          mediaType:   item.mediaType || 'image',
        };
      });
    }
  } catch(e) {
    console.warn('animals/test-tube/index.json not found:', e.message);
  }

  // 2. data/works.json（手動管理 — 優先）
  let manual = [];
  try {
    const r = await fetch(up + 'data/works.json');
    if (r.ok) manual = await r.json();
  } catch(e) {
    console.warn('data/works.json not found:', e.message);
  }

  // 3. マージ: test-tube を base に、manual で上書き
  const map = {};
  testtube.forEach(w => { map[w.id] = w; });
  manual.forEach(w => {
    // data/works.json の voltfoot は animals/test-tube/items/ 側があれば不要
    // ただし意図的に手動管理しているものは優先する
    if (!map[w.id] || w._manual) map[w.id] = w;
    else map[w.id] = w;  // 常に manual 優先
  });

  return Object.values(map);
}

/* ── URL param ── */
function getParam(key) {
  return new URLSearchParams(location.search).get(key);
}

/* ── Tag button ── */
function makeTagButton(label, onClick) {
  const btn = document.createElement('button');
  btn.className = 'tag';
  btn.type = 'button';
  btn.textContent = label;
  if (onClick) btn.addEventListener('click', onClick);
  return btn;
}

/* ── Tag link ── */
function makeTagLink(label, href) {
  const a = document.createElement('a');
  a.className = 'tag';
  a.textContent = label;
  a.href = href;
  return a;
}

/* ── rootUp: リポジトリルートへの相対プレフィックスを返す ──
 * works.json の画像パスは "animals/test-tube/..." のようにリポジトリルート基準。
 * 各ページから正しく解決するため、ページ深度に応じた ../ を返す。
 */
function rootUp() {
  const dir = location.pathname.replace(/\/[^\/]*$/, '');
  const segments = dir.split('/').filter(Boolean);
  const depth = Math.max(0, segments.length - 1);
  return depth > 0 ? '../'.repeat(depth) : '';
}

/* ── Image with fallback ── */
function makeImg(src, alt) {
  const img = document.createElement('img');
  img.alt = alt || '';
  img.loading = 'lazy';
  img.onerror = () => { img.style.display = 'none'; };
  // リポジトリルート基準パス（先頭が / でも http でもない）にプレフィックスを付加
  img.src = (src && !src.startsWith('/') && !src.startsWith('http')) ? rootUp() + src : src;
  return img;
}

/* ── Fade-in observer ── */
function initFadeIn() {
  const els = document.querySelectorAll('.fade-in');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  els.forEach(el => obs.observe(el));
}

/* ── Nav active ── */
function setActiveNav() {
  const path = location.pathname;
  document.querySelectorAll('.site-nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const isWorksPage = path.includes('/archive');
    const isWorksLink = href.includes('archive');
    a.classList.toggle('active', isWorksPage && isWorksLink);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initFadeIn();
});
