/**
 * gtm-events.js — archive (animals) 専用
 * GTM ID: GTM-54F4NP2W
 *
 * 計測イベント:
 *   view_item  — 作品カードクリック（一覧）
 *   tag_click  — タグクリック（一覧・詳細）
 *   download   — ダウンロード（work.html側で実装済み）
 *   scroll_end — ページ最下部到達（1回のみ）
 */
(function () {
  'use strict';

  window.dataLayer = window.dataLayer || [];

  /* view_item — 作品カードクリック */
  function initWorkCardTracking() {
    const grid = document.getElementById('works-grid') || document.getElementById('top-grid');
    if (!grid) return;
    grid.addEventListener('click', function (e) {
      const card = e.target.closest('.work-card');
      if (!card) return;
      if (e.target.closest('.tag--card')) return; // タグクリックは tag_click で計測
      const titleEl = card.querySelector('.work-card__title');
      const itemName = titleEl ? titleEl.textContent.trim() : decodeURIComponent(card.href.split('id=')[1] || 'unknown');
      window.dataLayer.push({
        event: 'view_item',
        item_name: itemName,
        item_url: card.href || '',
        page_path: location.pathname
      });
    });
  }

  /* tag_click — タグクリック */
  function initTagTracking() {
    document.addEventListener('click', function (e) {
      const tag = e.target.closest('.tag');
      if (!tag) return;
      if (tag.classList.contains('tag--clear')) return; // クリアボタンは除外
      window.dataLayer.push({
        event: 'tag_click',
        tag_name: tag.textContent.trim() || tag.dataset.tag || 'unknown',
        page_path: location.pathname
      });
    });
  }

  /* scroll_end — ページ最下部到達（1回のみ） */
  function initScrollEnd() {
    var fired = false;
    function onScroll() {
      if (fired) return;
      if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 50)) {
        fired = true;
        window.dataLayer.push({ event: 'scroll_end', page_path: location.pathname });
        window.removeEventListener('scroll', onScroll, { passive: true });
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function init() {
    initWorkCardTracking();
    initTagTracking();
    initScrollEnd();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
