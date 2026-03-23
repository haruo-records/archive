/*
  animals — haruo records
  shared utilities v4
*/

/* ── works.json fetch ── */
async function fetchWorks() {
  const res = await fetch('/animals/data/works.json');
  if (!res.ok) throw new Error('fetch failed');
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
    a.classList.toggle('active',
      path.includes('/works') && href.includes('works') ||
      path === '/animals/' && href === '/animals/'
    );
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initFadeIn();
});
