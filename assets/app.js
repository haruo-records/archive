/*
  animals — haruo records
  shared utilities v4
*/

/* ── works.json fetch ── */
async function fetchWorks() {
  // data/works.json はサイトルート直下に固定。
  // どのページ深度からでも正確に解決する。
  // 例: /works/        → segments=['works']        → up='../'
  // 例: /works/work.html → segments=['works','work.html'] → up='../../' (※ただし ../data/ でOK)
  // 正確な計算: ファイル名を除いたディレクトリ階層数だけ上がる
  const parts = location.pathname.replace(/\/[^\/]*$/, '').split('/').filter(Boolean);
  const up = parts.length > 0 ? '../'.repeat(parts.length) : '';
  const res = await fetch(up + 'data/works.json');
  if (!res.ok) throw new Error('fetch failed: ' + res.status + ' (' + up + 'data/works.json)');
  return res.json();
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

/* ── Image with fallback ── */
function makeImg(src, alt) {
  const img = document.createElement('img');
  img.alt = alt || '';
  img.loading = 'lazy';
  img.onerror = () => { img.style.display = 'none'; };
  img.src = src;
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
    const isHome     = path.endsWith('/') && !path.includes('/works');
    const isHomeLink = href === './' || href === '../' || href.endsWith('/animals/');
    a.classList.toggle('active', (isWorksPage && isWorksLink) || (isHome && isHomeLink));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initFadeIn();
});
