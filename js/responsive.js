/**
 * IMMERSIVE 3D BUTTERFLY WORLD — RESPONSIVE ADAPTATION & PERFORMANCE ENGINE
 * Handles screen resize, mobile layout adjustments, pixel ratio throttling,
 * touch detection, and orientation changes.
 */

window.NXResponsive = (function () {
  'use strict';

  let resizeTimeout = null;
  let isTouchDevice = false;

  function init() {
    isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (isTouchDevice) {
      document.body.classList.add('is-touch');
    }

    window.addEventListener('resize', onWindowResize, { passive: true });
    window.addEventListener('orientationchange', onOrientationChange, { passive: true });

    // Initial check
    applyResponsiveTweaks();
  }

  function onWindowResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (window.NXScene && window.NXScene.handleResize) {
        window.NXScene.handleResize();
      }

      if (window.ScrollTrigger) {
        window.ScrollTrigger.refresh();
      }

      applyResponsiveTweaks();
    }, 150);
  }

  function onOrientationChange() {
    setTimeout(() => {
      onWindowResize();
    }, 300);
  }

  function applyResponsiveTweaks() {
    const width = window.innerWidth;

    // Mobile specific layout helpers
    if (width <= 768) {
      document.body.classList.add('viewport-mobile');
      document.body.classList.remove('viewport-desktop');
    } else {
      document.body.classList.remove('viewport-mobile');
      document.body.classList.add('viewport-desktop');
    }
  }

  // Auto-init on load
  document.addEventListener('DOMContentLoaded', init);

  return {
    init: init,
    isTouch: function () { return isTouchDevice; }
  };
})();
