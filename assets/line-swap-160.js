// Match the personal-answer line fold: the outgoing thought and the incoming
// thought overlap, while the longest real variant owns the stable text slot.
export function mountLineSwap(root, values, initial = 0) {
  if (!root) return {show(){}};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const panels = values.map(value => {
    const panel = document.createElement('span');panel.className = 'line-swap-panel';panel.textContent = value;return panel;
  });
  root.classList.add('line-swap');root.replaceChildren(...panels);
  const animations = new Set();
  let current = initial, width = 0, run = 0;
  function settle() {
    run++;animations.forEach(animation => animation.cancel());animations.clear();
    panels.forEach((panel,index) => {
      panel.toggleAttribute('data-current',index === current);panel.removeAttribute('data-leaving');
      panel.setAttribute('aria-hidden',String(index !== current));
    });
    root.dataset.lineSwapIndex = String(current);root.dataset.lineSwapPhase = 'settled';
  }
  function typeset(force = false) {
    const nextWidth = Math.round(root.clientWidth);
    if (!nextWidth || !force && nextWidth === width) return;
    width = nextWidth;settle();
    panels.forEach((panel,index) => {
      const words = values[index].split(' ').map((word,i,all) => {
        const span = document.createElement('span');span.textContent = word + (i < all.length-1 ? ' ' : '');
        span.style.display = 'inline-block';span.style.whiteSpace = 'pre';return span;
      });
      panel.replaceChildren(...words);
      const lines = [];
      words.forEach(word => {
        const top = Math.round(word.getBoundingClientRect().top);
        if (!lines.length || Math.abs(lines.at(-1).top-top) > 3) lines.push({top,words:[]});
        lines.at(-1).words.push(word.textContent);
      });
      panel.replaceChildren(...lines.map(line => {
        const mask = document.createElement('span');mask.className = 'quote-line';
        const ink = document.createElement('span');ink.className = 'quote-line-ink';ink.textContent = line.words.join('');
        mask.append(ink);return mask;
      }));
    });
  }
  function animate(line, frames, timing) {
    const animation = line.animate(frames,{...timing,fill:'both'});animations.add(animation);
    return animation.finished.catch(() => {});
  }
  function show(next, motion = true) {
    if (next === current) return;
    const poses = new Map(), retiring = [];
    panels.filter(panel => panel.hasAttribute('data-current') || panel.hasAttribute('data-leaving')).forEach(panel => {
      let visible = false;
      panel.querySelectorAll('.quote-line-ink').forEach(line => {
        const style = getComputedStyle(line);poses.set(line,{transform:style.transform,opacity:style.opacity});
        if (Number(style.opacity) > .001) visible = true;
      });
      if (visible) retiring.push(panel);
    });
    current = next;settle();
    if (!motion || reduced.matches || document.hidden) return;
    const token = run, incoming = panels[current], jobs = [];
    root.dataset.lineSwapPhase = 'moving';
    // Keep a still-visible older thought during a rapid A→B→C reversal,
    // even when B has not yet reached its admission delay.
    retiring.filter(panel => panel !== incoming).forEach(outgoing => {
      outgoing.setAttribute('data-leaving','');
      outgoing.querySelectorAll('.quote-line-ink').forEach((line,i) => jobs.push(animate(line,[
        poses.get(line) || {transform:'none',opacity:1},
        {transform:'translateY(-65%) rotateX(65deg)',opacity:0}
      ],{duration:180,delay:i*18,easing:'cubic-bezier(.4,0,1,1)'})));
    });
    incoming.querySelectorAll('.quote-line-ink').forEach((line,i) => jobs.push(animate(line,[
      poses.get(line) || {transform:'translateY(70%) rotateX(-65deg)',opacity:0},
      {transform:'none',opacity:1}
    ],{duration:420,delay:100+i*35,easing:'cubic-bezier(.16,1,.3,1)'})));
    Promise.all(jobs).then(() => {if (token === run) settle();});
  }
  const resize = new ResizeObserver(() => typeset());resize.observe(root);
  const visibility = () => {if (document.hidden) settle();};
  reduced.addEventListener('change',settle);document.addEventListener('visibilitychange',visibility);addEventListener('pagehide',settle);
  document.fonts.ready.then(() => typeset(true));typeset();settle();
  return {show};
}
