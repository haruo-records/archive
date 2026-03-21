/*
  haruo records / animals — shared utilities
  ※ このファイルは全ページで読み込む共通ライブラリです
*/

/* ── works.json 取得 ─────────────────── */

/**
 * works.json をフェッチして返す
 * @returns {Promise<Array>}
 */
async function fetchWorks() {
  const res = await fetch('/portal/data/works.json');
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  return res.json();
}

/* ── URL パラメータ ───────────────────── */

/**
 * クエリパラメータを取得
 * @param {string} key
 * @returns {string|null}
 */
function getParam(key) {
  return new URLSearchParams(location.search).get(key);
}

/* ── DOM ヘルパー ────────────────────── */

/**
 * タグピル要素を生成（button or a）
 */
function makeTagButton(label, onClick) {
  const el = document.createElement('button');
  el.className = 'tag';
  el.type = 'button';
  el.textContent = label;
  if (onClick) el.addEventListener('click', onClick);
  return el;
}

function makeTagLink(label, href) {
  const el = document.createElement('a');
  el.className = 'tag';
  el.textContent = label;
  el.href = href;
  return el;
}

/**
 * 画像 + 読み込み失敗時のフォールバック
 */
function makeImg(src, alt, extraClass = '') {
  const img = document.createElement('img');
  if (extraClass) img.className = extraClass;
  img.alt = alt || '';
  img.loading = 'lazy';
  img.onerror = () => { img.style.display = 'none'; };
  img.src = src; // srcはlastにセット
  return img;
}

/* ── ナビ active 管理 ────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const path = location.pathname;
  document.querySelectorAll('.site-nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    // /portal/works/ にいるとき works リンクをアクティブに
    const isActive =
      (href.includes('works') && path.includes('/works')) ||
      (href === '/portal/' && path === '/portal/');
    a.classList.toggle('active', isActive);
  });
});
