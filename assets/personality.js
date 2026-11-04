/* Native portfolio enhancements and an SVG fallback for the masthead.
 * The actual React Bits Tech Text engine is mounted in interactions.js.
 */
(() => {
  const root = document.documentElement;
  const themeButton = document.getElementById('themeBtn');
  try {
    const theme = localStorage.getItem('ghazi-theme');
    if (theme === 'dark' || theme === 'light') root.dataset.theme = theme;
  } catch { /* Storage can be unavailable in private browsing. */ }
  const dark = root.dataset.theme === 'dark';
  themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
  themeButton.querySelector('.t-ico').textContent = dark ? '◑' : '◐';
  themeButton.querySelector('.t-txt').textContent = dark ? ' LIGHT' : ' DARK';

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  if (document.querySelector('.identity svg')) {
  const wordmark = document.querySelector('.identity svg');
  const circles = [document.getElementById('techCircle'), document.getElementById('solidCircle')];
  let frame = 0;
  let pointer;
  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    circles.forEach(circle => circle.setAttribute('cx', '-500'));
  }
  wordmark.addEventListener('pointermove', event => {
    if (motion.matches || !finePointer.matches) return;
    pointer = { x: event.clientX, y: event.clientY };
    if (frame) return;
    frame = requestAnimationFrame(() => {
      const point = new DOMPoint(pointer.x, pointer.y).matrixTransform(wordmark.getScreenCTM().inverse());
      circles.forEach(circle => {
        circle.setAttribute('cx', point.x);
        circle.setAttribute('cy', point.y);
      });
      frame = 0;
    });
  });
  wordmark.addEventListener('pointerleave', reset);
  motion.addEventListener('change', reset);

  }

  // The original annotations were hover-only; keyboard users get the same story.
  document.querySelectorAll('.anno').forEach((annotation, index) => {
    annotation.tabIndex = 0;
    const popup = annotation.querySelector('.pop');
    popup.id = `annotation-${index + 1}`;
    popup.setAttribute('role', 'tooltip');
    popup.hidden = true;
    annotation.setAttribute('aria-describedby', popup.id);
    const position = () => {
      annotation.classList.remove('tooltip-dismissed');
      popup.hidden = false;
      popup.style.left = '0px';
      const box = popup.getBoundingClientRect();
      const shift = Math.min(0, innerWidth - 16 - box.right) + Math.max(0, 16 - box.left);
      popup.style.left = `${shift}px`;
    };
    annotation.addEventListener('focus', position);
    annotation.addEventListener('mouseenter', position);
    annotation.addEventListener('blur', () => { popup.hidden = true; });
    annotation.addEventListener('mouseleave', () => { if (document.activeElement !== annotation) popup.hidden = true; });
    annotation.addEventListener('keydown', event => {
      if (event.key === 'Escape') { annotation.classList.add('tooltip-dismissed'); popup.hidden = true; }
    });
  });

  const film = document.querySelector('.frames');
  const filmFrames = [...film.children];
  const filmPrev = document.getElementById('filmPrev');
  const filmNext = document.getElementById('filmNext');
  const filmCount = document.getElementById('filmCount');
  let filmIndex = 0;
  function showFrame(index) {
    filmIndex = Math.max(0, Math.min(filmFrames.length - 1, index));
    film.scrollTo({ left: filmFrames[filmIndex].offsetLeft - filmFrames[0].offsetLeft, behavior: motion.matches ? 'instant' : 'smooth' });
  }
  filmPrev.addEventListener('click', () => showFrame(filmIndex - 1));
  filmNext.addEventListener('click', () => showFrame(filmIndex + 1));
  film.addEventListener('keydown', event => {
    if (event.target !== film || film.scrollWidth <= film.clientWidth) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      showFrame(filmIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  film.addEventListener('scroll', () => {
    const distance = filmFrames[1].offsetLeft - filmFrames[0].offsetLeft;
    filmIndex = Math.max(0, Math.min(filmFrames.length - 1, Math.round(film.scrollLeft / distance)));
    filmPrev.disabled = filmIndex === 0;
    filmNext.disabled = filmIndex === filmFrames.length - 1;
    filmCount.textContent = `0${filmIndex + 1} / 03`;
  }, { passive: true });

  // Native details are the no-script fallback. Enhanced cases use a focused reader.
  // The source article keeps its footprint; closing returns to the same browsing position.
  const portalSupported = CSS.supports('selector(details::details-content)');
  const cases = [...document.querySelectorAll('.project-case')];
  const readers = new Map();
  let activeCase;
  const names = { 'ai-risk-case': 'AI risk assistant', 'advocate-case': 'Advocate', 'work-case': 'The Surge', 'platform-case': 'PLA & LAUNCH' };
  const route = () => location.pathname + location.search + location.hash;
  function setReaderOrigin(state, origin) {
    const rect = origin.getBoundingClientRect ? origin.getBoundingClientRect() : origin;
    const top = Math.max(0, Math.min(innerHeight - 1, rect.top));
    const left = Math.max(0, Math.min(innerWidth - 1, rect.left));
    const bottom = Math.max(top + 1, Math.min(innerHeight, rect.bottom));
    const right = Math.max(left + 1, Math.min(innerWidth, rect.right));
    state.dialog.style.setProperty('--reader-origin', `inset(${top}px ${innerWidth-right}px ${innerHeight-bottom}px ${left}px)`);
  }
  function closeCase(details, { onward, routing = true } = {}) {
    const state = readers.get(details);
    if (!state.dialog.open) return;
    if (!portalSupported) details.open = false;
    details.querySelector('summary').setAttribute('aria-expanded', 'false');
    document.body.style.overflow = state.bodyOverflow;
    activeCase = null;
    if (routing && location.hash === `#${details.id}`) {
      // A synchronous replace never races a following navigation click.
      history.replaceState({ portfolioCaseSlot: true }, '', state.returnURL || location.pathname + location.search);
    }
    window.scrollTo({ top: state.scroll, behavior: 'instant' });
    const origin = state.origin?.checkVisibility() && !state.origin.closest('[inert]') ? state.origin : details.querySelector('summary');
    origin.focus({ preventScroll: true });
    setReaderOrigin(state, origin);
    state.dialog.close();
    window.dispatchEvent(new Event('resize'));
    onward?.();
  }
  window.setPortfolioCase = (details, open, { origin, onward, routing = true } = {}) => {
    if (!details) return Promise.resolve();
    if (!open) { closeCase(details, { onward, routing }); return Promise.resolve(); }
    if (readers.get(details).dialog.open) return Promise.resolve();
    if (activeCase) closeCase(activeCase, { routing: false });
    const state = readers.get(details);
    state.origin = origin || details.querySelector('summary');
    state.scroll = scrollY;
    state.originBox = state.origin.getBoundingClientRect();
    state.returnURL = route();
    if (state.returnURL.endsWith(`#${details.id}`)) state.returnURL = location.pathname + location.search;
    state.bodyOverflow = document.body.style.overflow;
    if (details.id === 'advocate-case' && document.getElementById('main-preview-app').getAttribute('aria-selected') === 'true') window.selectAdvocateScreen?.(3);
    if (!portalSupported) details.open = true;
    details.querySelector('summary').setAttribute('aria-expanded', 'true');
    activeCase = details;
    document.body.style.overflow = 'hidden';
    if (routing) {
      const method = history.state?.portfolioCaseSlot ? 'replaceState' : 'pushState';
      history[method]({ portfolioCase: details.id, portfolioCaseSlot: true }, '', `#${details.id}`);
    }
    setReaderOrigin(state, state.originBox);
    state.dialog.showModal();
    state.dialog.scrollTop = 0;
    details.dispatchEvent(new Event('portfolio:caseopen'));
    state.close.focus({ preventScroll: true });
    window.dispatchEvent(new Event('resize'));
    return Promise.resolve();
  };
  cases.forEach(details => {
    details.dataset.reader = '';
    details.open = false;
    details.closest('.project-entry').classList.add('reader-host');
    const summary = details.querySelector('summary');
    const body = details.querySelector('.case-body');
    const dialog = document.createElement('dialog');
    dialog.className = 'case-reader';
    dialog.setAttribute('aria-label', `${names[details.id]} case study`);
    const bar = document.createElement('div');
    bar.className = 'case-reader-bar';
    bar.innerHTML = `<span><span class="case-reader-name">${names[details.id]}</span> <small>/ Case study</small></span><button type="button" class="case-reader-close">Close <span aria-hidden="true">×</span></button>`;
    dialog.append(bar, body);
    details.append(dialog);
    const close = bar.querySelector('button');
    readers.set(details, { dialog, close, article: details.closest('.project-entry') });
    summary.addEventListener('click', event => {
      event.preventDefault();
      window.setPortfolioCase(details, !dialog.open, { origin: summary });
    });
    document.querySelectorAll(`a[href="#${details.id}"]`).forEach(link => {
      link.addEventListener('click', event => {
        event.preventDefault();
        window.setPortfolioCase(details, true, { origin: link });
        if (link.dataset.caseStory) {
          const target = details.querySelector(`#${link.dataset.caseStory}`);
          if (target) {
            target.tabIndex = -1;
            target.scrollIntoView({ block:'start', behavior:'instant' });
            target.focus({ preventScroll:true });
            details.querySelectorAll('.case-story-nav a').forEach(item => {
              if (item.hash === `#${target.id}`) item.setAttribute('aria-current','location');
              else item.removeAttribute('aria-current');
            });
          }
        }
      });
    });
    close.addEventListener('click', () => window.setPortfolioCase(details, false));
    dialog.addEventListener('cancel', event => { event.preventDefault(); window.setPortfolioCase(details, false); });
    const end = document.createElement('button');
    end.type = 'button'; end.className = 'case-end'; end.textContent = 'Back to selected work ↑';
    end.addEventListener('click', () => window.setPortfolioCase(details, false));
    body.append(end);
  });
  function revealHash() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    if (id === 'cora-case') {
      id = 'ai-risk-case';
      history.replaceState(history.state, '', location.pathname + location.search + '#ai-risk-case');
    }
    const details = cases.find(item => item.id === id);
    if (activeCase && activeCase !== details) closeCase(activeCase, { routing: false });
    if (details) window.setPortfolioCase(details, true, { routing: false });
  }
  addEventListener('popstate', revealHash);
  addEventListener('hashchange', revealHash);
  if (location.hash) requestAnimationFrame(revealHash);

  // Assemble and copy only after interaction; plaintext remains available for manual copy.
  const addressParts = [[103,104,97,122,105,101,97,114,121,97,110], [103,109,97,105,108], [99,111,109]];
  document.querySelectorAll('.contact-reveal').forEach(button => {
    let copySequence = 0;
    button.addEventListener('click', async () => {
      const attempt = ++copySequence;
      let copyDeadline;
      const requestId = button.dataset.heroCopyRequest;delete button.dataset.heroCopyRequest;
      const parts = addressParts.map(part => String.fromCharCode(...part));
      const address = parts[0] + '@' + parts[1] + '.' + parts[2];
      const output = document.getElementById('contactAddress');
      const status = document.getElementById('contactStatus');
      output.textContent = address; output.hidden = false;
      const text = button.querySelector('.contact-text');
      try {
        // A browser permission request can leave writeText pending indefinitely.
        // Bound the UI wait; the selected address remains a truthful fallback.
        await Promise.race([
          navigator.clipboard.writeText(address),
          new Promise((_, reject) => { copyDeadline = setTimeout(() => reject(new Error('Clipboard timed out')), 1800); })
        ]);
        if (attempt !== copySequence) return;
        text.textContent = 'Email copied!'; status.className = 'sr-only'; status.textContent = 'Email address copied.';
        button.dispatchEvent(new CustomEvent('portfolio-email-result',{detail:{copied:true,address,requestId}}));
        button.querySelector('.contact-spark')?.remove();
        if (!motion.matches) {
          const spark = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          spark.setAttribute('viewBox', '0 0 40 40'); spark.setAttribute('aria-hidden', 'true');
          spark.classList.add('contact-spark');
          spark.innerHTML = '<path d="M20 2v9m0 18v9M2 20h9m18 0h9M7 7l6 6m14 14 6 6M7 33l6-6m14-14 6-6"/>';
          button.append(spark);
          spark.animate([{opacity:0,transform:'scale(.25) rotate(-20deg)'},{opacity:1,transform:'scale(.8) rotate(0deg)',offset:.35},{opacity:0,transform:'scale(1.15) rotate(15deg)'}], {duration:560,easing:'cubic-bezier(.22,.7,.18,1)'}).finished.then(() => spark.remove(), () => spark.remove());
        }
      } catch {
        if (attempt !== copySequence) return;
        let selected = false;
        try {
          const range = document.createRange(); range.selectNodeContents(output);
          const selection = getSelection();
          if (selection) { selection.removeAllRanges(); selection.addRange(range); selected = true; }
        } catch { /* The visible address still supports manual copy. */ }
        text.textContent = selected ? 'Email selected' : 'Copy email';
        status.className = 'contact-copy-hint'; status.textContent = selected ? 'Copy the selected address.' : 'Select the address to copy it.';
        button.dispatchEvent(new CustomEvent('portfolio-email-result',{detail:{copied:false,address,requestId}}));
      } finally { clearTimeout(copyDeadline); }
    });
  });
})();
