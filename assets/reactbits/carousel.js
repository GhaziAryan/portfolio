/* React Bits Carousel, native lifecycle port for Ghazi's static portfolio.
 * Upstream: https://reactbits.dev/r/Carousel-JS-CSS.json
 * Copyright (c) 2026 David Haz. See LICENSE.txt.
 * Preserves the upstream slide pose, spring integration, edge resistance,
 * drag threshold and momentum snapping; adds semantic HTML tabs, inert panels,
 * dynamic reduced motion and reader-controlled navigation. No autoplay.
 */
const STIFFNESS = 150;
const DAMPING = 24;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const band = (value, max) => {
  if (value < 0) return -0.3 * (1 - Math.exp(value / 0.55));
  if (value > max) return max + 0.3 * (1 - Math.exp((max - value) / 0.55));
  return value;
};

export function mountDecisionCarousel(root) {
  if (!root) return;
  const viewport = root.querySelector('.decision-viewport');
  const slides = [...root.querySelectorAll('.decision-slide')];
  const tabs = [...root.querySelectorAll('[role=tab]')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const state = { p:0, v:0, target:0, shown:0, drag:null, last:0, suppress:false, visible:true };
  let raf = 0;
  const unit = () => viewport.clientWidth;
  const limit = value => clamp(value, 0, slides.length - 1);
  function announce() {
    state.shown = limit(Math.round(state.target));
    tabs.forEach((tab, i) => {
      tab.disabled = false;
      tab.setAttribute('aria-selected', String(i === state.shown));
      tab.tabIndex = i === state.shown ? 0 : -1;
      slides[i].inert = i !== state.shown;
      slides[i].setAttribute('aria-hidden', String(i !== state.shown));
    });
  }
  function apply() {
    const width = unit();
    slides.forEach((slide, i) => {
      // Upstream's slide pose uses the distance times card span.
      const x = (i - state.p) * width;
      slide.hidden = Math.abs(i - state.p) > 1.01;
      slide.style.transform = `translate3d(${x}px,0,0)`;
    });
  }
  function tick(now) {
    raf = 0;
    if (!state.visible) { state.last = 0; return; }
    const dt = state.last ? Math.min(0.05, (now - state.last) / 1000) : 1 / 60;
    state.last = now;
    if (!state.drag?.moved) {
      if (motion.matches) { state.p = state.target; state.v = 0; }
      else {
        const steps = Math.ceil(dt * 240);
        const h = dt / steps;
        for (let k = 0; k < steps; k++) {
          state.v += (STIFFNESS * (state.target - state.p) - DAMPING * state.v) * h;
          state.p += state.v * h;
        }
        if (Math.abs(state.target - state.p) < 0.0004 && Math.abs(state.v) < 0.004) {
          state.p = state.target; state.v = 0;
        }
      }
    }
    apply();
    if (state.p !== state.target && !state.drag?.moved) raf = requestAnimationFrame(tick);
    else state.last = 0;
  }
  function wake() { if (!raf && state.visible) raf = requestAnimationFrame(tick); }
  function moveTo(target) { state.target = limit(target); announce(); wake(); }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => moveTo(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); moveTo(next); tabs[next].focus(); }
    });
  });
  viewport.addEventListener('pointerdown', event => {
    if (event.target.closest('a,button') || (event.pointerType === 'mouse' && event.button !== 0)) return;
    state.drag = { id:event.pointerId, x:event.clientX, y:event.clientY, p:state.p, from:0, moved:false, samples:[] };
  });
  viewport.addEventListener('pointermove', event => {
    const drag = state.drag;
    if (!drag || event.pointerId !== drag.id) return;
    if (!drag.moved) {
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      if (Math.abs(dy) > Math.abs(dx)) { state.drag = null; return; }
      drag.moved = true;
      drag.x = event.clientX; drag.p = state.p; drag.from = Math.round(state.target);
      viewport.setPointerCapture(event.pointerId);
      viewport.dataset.dragging = 'true';
    }
    state.p = band(drag.p - (event.clientX - drag.x) / unit(), slides.length - 1);
    state.v = 0; state.target = Math.round(limit(state.p));
    drag.samples.push([event.timeStamp, event.clientX]);
    if (drag.samples.length > 8) drag.samples.shift();
    announce(); apply();
  });
  function release(event, cancelled = false) {
    const drag = state.drag;
    if (!drag || event.pointerId !== drag.id) return;
    state.drag = null;
    delete viewport.dataset.dragging;
    if (!drag.moved) { wake(); return; }
    state.suppress = true;
    setTimeout(() => { state.suppress = false; }, 0);
    if (cancelled) { state.v = 0; moveTo(drag.from); return; }
    const sample = drag.samples.find(([time]) => event.timeStamp - time < 90) ?? [event.timeStamp, event.clientX];
    const elapsed = Math.max(16, event.timeStamp - sample[0]);
    const velocity = clamp(((sample[1] - event.clientX) / elapsed) * (1000 / unit()), -12, 12);
    const travelled = state.p - drag.from;
    let target = Math.round(state.p + velocity * 0.2);
    if (target === drag.from) {
      if (Math.abs(velocity) > 0.8) target += Math.sign(velocity);
      else if (Math.abs(travelled) > 0.18) target += Math.sign(travelled);
    }
    state.v = state.p >= 0 && state.p <= slides.length - 1 ? velocity : 0;
    moveTo(target);
  }
  viewport.addEventListener('pointerup', event => release(event));
  viewport.addEventListener('pointercancel', event => release(event, true));
  viewport.addEventListener('lostpointercapture', event => release(event, true));
  viewport.addEventListener('click', event => {
    if (state.suppress) { event.preventDefault(); event.stopPropagation(); }
  }, true);
  new ResizeObserver(apply).observe(viewport);
  new IntersectionObserver(([entry]) => { state.visible = entry.isIntersecting; if (state.visible) wake(); }).observe(root);
  motion.addEventListener('change', () => { state.p = state.target; state.v = 0; apply(); });
  root.dataset.enhanced = 'true';
  announce(); apply();
}
