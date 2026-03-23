/*
  animals — haruo records
  shared utilities v4
*/

/* ── works.json fetch ──
 *
 * GitHub Pages project site では URL に /archive/ プレフィックスが付く:
 *   https://haruo-records.github.io/archive/
 *   https://haruo-records.github.io/archive/works/
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
 *   /archive/works/   → parts=['works'] depth=1 → fetch("../data/works.json")
 *   /archive/works/work.html → 同上
 */
async function fetchWorks() {
  // ディレクトリ部分のみ取り出す（末尾のファイル名を除去）
  const dir = location.pathname.replace(/\/[^\/]*$/, ''); // 例: /archive/works
  // / で分割して空文字と先頭のリポジトリ名('archive')を除いたページ固有部分
  const segments = dir.split('/').filter(Boolean); // 例: ['archive', 'works']
  // segments[0] がリポジトリ名なので除外、残りが実際の階層深さ
  const depth = Math.max(0, segments.length - 1);  // 例: 1
  const up = depth > 0 ? '../'.repeat(depth) : '';  // 例: '../'
  const url = up + 'data/works.json';               // 例: '../data/works.json'
  const res = await fetch(url);
  if (!res.ok) throw new Error('fetchWorks failed: HTTP ' + res.status + ' for ' + url);
  return res.json();
}

/* ── fetchAllWorks ──
 * data/works.json（手動管理）と
 * test-tube/index.json（organize_animals.py で自動生成）を
 * 両方読み込んで統合して返す。
 * test-tube/index.json が存在しなくても動作する。
 */
async function fetchAllWorks() {
  const dir = location.pathname.replace(/\/[^\/]*$/, '');
  const segs = dir.split('/').filter(Boolean);
  const depth = Math.max(0, segs.length - 1);
  const up = depth > 0 ? '../'.repeat(depth) : '';

  // 1. data/works.json（必須）
  let base = [];
  try {
    const r = await fetch(up + 'data/works.json');
    if (r.ok) base = await r.json();
  } catch(e) {}

  // 2. test-tube/index.json（任意 — organize_animals.py 生成物）
  let testtube = [];
  try {
    const r = await fetch(up + 'test-tube/index.json');
    if (r.ok) {
      const raw = await r.json();
      testtube = raw.map(item => {
        const slug   = item.slug;
        const folder = item.folder || ('items/' + slug);
        const files  = item.sourceFiles || [];
        const thumbFile = (item.thumbnail || '').split('/').pop() || files[0] || '';
        return {
          id:          slug,
          title:       item.title || slug,
          series:      'test-tube',
          observed:    item.date || '',
          tags:        ['test-tube animals'],
          thumbnail:   thumbFile ? ('test-tube/' + folder + '/' + thumbFile) : '',
          images:      files.map(f => 'test-tube/' + folder + '/' + f),
          description: '',
          links:       [],
        };
      });
    }
  } catch(e) {}

  // 3. マージ（id重複は data/works.json を優先）
  const map = {};
  testtube.forEach(w => { map[w.id] = w; });
  base.forEach(w => { map[w.id] = w; });

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
    const isWorksPage = path.includes('/works');
    const isWorksLink = href.includes('works');
    a.classList.toggle('active', isWorksPage && isWorksLink);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initFadeIn();
});
