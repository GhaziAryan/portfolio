/* Immediate state updates and local motion keep every control responsive. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // State changes happen immediately; local DOM remains the hit target throughout.
  window.portfolioTransition = update => { update(); return Promise.resolve(); };
  // A palette change dissolves the current paint, with no layout or scroll move.
  // Interrupted switches keep the most recently requested palette.
  let themeRun, themeVersion = 0, themeCleanup;
  window.portfolioThemeTransition = update => {
    const root = document.documentElement, request = ++themeVersion;
    themeRun?.skipTransition();
    clearTimeout(themeCleanup);
    const finish = () => {
      if (request !== themeVersion) return;
      root.classList.remove('theme-changing', 'theme-snapshot');
      themeRun = null;
    };
    if (reduced.matches) { update(); finish(); return Promise.resolve(); }
    root.classList.add('theme-changing');
    const fallback = () => {
      root.classList.remove('theme-snapshot');
      update();
      themeCleanup = setTimeout(finish, 420);
      return Promise.resolve();
    };
    if (!document.startViewTransition) return fallback();
    root.classList.add('theme-snapshot');
    try {
      themeRun = document.startViewTransition(() => {
        if (request !== themeVersion) return;
        update();
      });
      // Canceling a rapid reversal may reject readiness before capture begins.
      themeRun.ready?.catch(() => {});
      themeRun.updateCallbackDone?.catch(() => {});
      return themeRun.finished.catch(() => {}).then(finish);
    } catch { return fallback(); }
  };
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      themeRun?.skipTransition();
      document.documentElement.classList.remove('theme-changing', 'theme-snapshot');
    }
  });
  const swaps = new WeakMap();
  // Only outgoing content fades. The new surface is fully painted underneath,
  // so interrupted changes never restart a dimming pulse or intercept a click.
  window.portfolioSwap = (element, update, instant = false) => {
    swaps.get(element)?.();
    if (!element || reduced.matches || instant || !element.checkVisibility()) { update(); return; }
    const box = element.getBoundingClientRect();
    if (!box.width || !box.height) { update(); return; }
    const parent = element.parentElement;
    if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
    const bounds = parent.getBoundingClientRect();
    const outgoing = element.cloneNode(true);
    outgoing.querySelectorAll('img').forEach((image, index) => {
      const original = element.querySelectorAll('img')[index];
      image.style.transform = getComputedStyle(original).transform;
    });
    outgoing.removeAttribute('id');
    outgoing.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    outgoing.setAttribute('aria-hidden', 'true'); outgoing.inert = true;
    outgoing.classList.add('outgoing-surface');
    Object.assign(outgoing.style, { position: 'absolute', left: `${box.left-bounds.left+parent.scrollLeft-parent.clientLeft}px`, top: `${box.top-bounds.top+parent.scrollTop-parent.clientTop}px`, width: `${box.width}px`, height: `${box.height}px`, margin: '0', zIndex: '2', pointerEvents: 'none' });
    // Screen crops retain their existing transform; positioning uses the uncropped figure.
    parent.append(outgoing);
    update();
    const animation = outgoing.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: 'ease-out' });
    const cleanup = () => { animation.cancel(); outgoing.remove(); if (swaps.get(element) === cleanup) swaps.delete(element); };
    swaps.set(element, cleanup);
    animation.finished.then(cleanup, () => {});
  };

  // Move the complete device as one object; never shift its screen inside the bezel.
  const devices = [...document.querySelectorAll('.device-float')];
  let frame = 0;
  function paint() {
    frame = 0;
    devices.forEach(device => {
      const stage = device.closest('.live-product');
      if (!stage.checkVisibility()) return;
      const box = stage.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (innerHeight / 2 - box.top - box.height / 2) / innerHeight));
      device.style.setProperty('--device-drift', reduced.matches ? '0px' : `${progress * 28}px`);
    });
    const history = document.getElementById('history');
    if (history) {
      const box = history.getBoundingClientRect();
      history.style.setProperty('--career-progress', Math.max(0, Math.min(1, (innerHeight * .8 - box.top) / box.height)));
    }
  }
  function requestPaint() { if (!frame) frame = requestAnimationFrame(paint); }
  addEventListener('scroll', requestPaint, { passive: true });
  addEventListener('resize', requestPaint, { passive: true });
  reduced.addEventListener('change', requestPaint);
  requestPaint();
})();
