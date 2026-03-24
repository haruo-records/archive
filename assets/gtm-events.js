/**
 * gtm-events.js — Animals / haruo records
 * GTM dataLayer イベント計測
 * GTM ID: GTM-54F4NP2W
 *
 * 計測イベント:
 *   view_item   — 作品カードクリック（一覧）
 *   tag_click   — タグクリック（一覧・詳細）
 *   image_click — 作品画像クリック（詳細）
 *   download    — ダウンロードボタンクリック（詳細）※work.html側に実装済み
 *   scroll_end  — ページ最下部到達（全ページ）
 */

(function () {
  'use strict';

  window.dataLayer = window.dataLayer || [];

  /* ─────────────────────────────────────────
     ① view_item — 作品カードクリック
     対象: .work-card（一覧ページで動的生成）
     イベント委譲でグリッドコンテナを監視
  ───────────────────────────────────────── */
  function initWorkCardTracking() {
    const grid = document.getElementById('works-grid') || document.getElementById('top-grid');
    if (!grid) return;

    grid.addEventListener('click', function (e) {
      // .work-card または その子要素のクリック
      const card = e.target.closest('.work-card');
      if (!card) return;

      // カード内タグクリックは tag_click で別途計測するため除外
      if (e.target.closest('.tag--card')) return;

      const titleEl = card.querySelector('.work-card__title');
      const itemName = titleEl ? titleEl.textContent.trim() : card.href.split('id=')[1] || 'unknown';

      window.dataLayer.push({
        event: 'view_item',
        item_name: decodeURIComponent(itemName),
        item_url: card.href || '',
        page_path: location.pathname
      });
    });
  }

  /* ─────────────────────────────────────────
     ② tag_click — タグクリック
     対象A: フィルターバーのタグボタン（一覧）
     対象B: カード内タグ .tag--card（一覧）
     対象C: 詳細ページのタグリンク .work-meta-block__tags .tag
  ───────────────────────────────────────── */
  function initTagTracking() {
    // イベント委譲: document 全体を監視（動的生成対応）
    document.addEventListener('click', function (e) {
      const tag = e.target.closest('.tag');
      if (!tag) return;

      // クリアボタン（tag--clear）は除外
      if (tag.classList.contains('tag--clear')) return;

      const tagName = tag.textContent.trim() || tag.dataset.tag || 'unknown';

      window.dataLayer.push({
        event: 'tag_click',
        tag_name: tagName,
        page_path: location.pathname
      });
    });
  }

  /* ─────────────────────────────────────────
     ③ image_click — 作品画像クリック
     対象: 詳細ページの .image-row 内の img
     イベント委譲で .image-field を監視
  ───────────────────────────────────────── */
  function initImageClickTracking() {
    document.addEventListener('click', function (e) {
      const img = e.target.closest('.image-row img');
      if (!img) return;

      // src からファイル名を抽出
      const src = img.src || img.dataset.src || '';
      const fileName = src.split('/').pop().split('?')[0] || 'unknown';

      window.dataLayer.push({
        event: 'image_click',
        image_name: fileName,
        page_path: location.pathname
      });
    });
  }

  /* ─────────────────────────────────────────
     ⑤ scroll_end — ページ最下部到達
     1回のみ発火（フラグで制御）
  ───────────────────────────────────────── */
  function initScrollEndTracking() {
    let fired = false;

    function onScroll() {
      if (fired) return;
      // ページ下部まで到達（バッファ: 50px）
      if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 50)) {
        fired = true;
        window.dataLayer.push({
          event: 'scroll_end',
          page_path: location.pathname
        });
        // 発火後はリスナーを除去してメモリ解放
        window.removeEventListener('scroll', onScroll, { passive: true });
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ─────────────────────────────────────────
     初期化 — DOM 準備完了後に実行
  ───────────────────────────────────────── */
  function init() {
    initWorkCardTracking();
    initTagTracking();
    initImageClickTracking();
    initScrollEndTracking();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
