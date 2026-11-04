// ── theme ──
const tbtn = document.getElementById('themeBtn');
let desiredTheme;
tbtn.addEventListener('click', () => {
    desiredTheme = (desiredTheme || document.documentElement.dataset.theme) === 'light' ? 'dark' : 'light';
    const next = desiredTheme;
    window.portfolioThemeTransition(() => {
    document.documentElement.dataset.theme = next;
    tbtn.setAttribute("aria-label", "Switch to " + (next === "light" ? "dark" : "light") + " theme");
    try { localStorage.setItem("ghazi-theme", next); } catch {}
    tbtn.querySelector('.t-ico').textContent = next === 'light' ? '◐' : '◑';
    tbtn.querySelector('.t-txt').textContent = next === 'light' ? ' DARK' : ' LIGHT';
    });
});

// ── reveals ──
document.querySelectorAll('.hero h1 .w > span').forEach((s, i) => s.style.transitionDelay = (i * 0.07) + 's');
setTimeout(() => document.getElementById('hero').classList.add('in'), 180);

// Results stay readable rather than animating through inaccurate intermediate values.
document.querySelectorAll('.cnt').forEach(el => { el.textContent = el.dataset.to; });

// ── expanders ──
document.querySelectorAll('.more-btn').forEach((btn, i) => {
    const panel = btn.closest('.more').querySelector('.more-panel');
    panel.id = panel.id || 'case-details-' + i;
    btn.setAttribute('aria-controls', panel.id);
    btn.setAttribute('aria-expanded', 'false');
    panel.inert = true;
    btn.addEventListener('click', () => {
        const open = btn.closest('.more').classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
        panel.inert = !open;
    });
});

// ── advocate demo (real product language: ramble → reflection → competency → cited story) ──
(function () {
    const scrollBox = document.getElementById('advScroll');
    const story = document.getElementById('advStory');
    const input = document.getElementById('advInput');
    const btn = document.getElementById('advBtn');
    let n = 1, busy = false;
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

    const firstNote = scrollBox.querySelector('.adv-entry');
    firstNote.id = 'adv-note-1';
    firstNote.tabIndex = -1;
    const citation = number => `<button type="button" class="source-citation" data-source="adv-note-${number}" aria-label="Read source note ${number}">[${number}]</button>`;
    story.querySelector('sup').innerHTML = citation(1);
    const sourceLabel = document.querySelector('.adv-head b');
    function showSource(source) {
        scrollBox.querySelectorAll('.adv-entry').forEach(note => { note.hidden = note !== source; });
        sourceLabel.textContent = `Source note ${source.id.split('-').pop()}`;
        scrollBox.scrollTop = 0;
    }
    const highlights = new WeakMap();
    story.addEventListener('click', event => {
        const button = event.target.closest('[data-source]');
        if (!button) return;
        const source = document.getElementById(button.dataset.source);
        if (!source) return;
        showSource(source);
        source.focus({ preventScroll: true });
        source.classList.add('source-note-highlight');
        clearTimeout(highlights.get(source));
        highlights.set(source, setTimeout(() => source.classList.remove('source-note-highlight'), 2400));
    });

    function compFor(t) {
        const s = t.toLowerCase();
        if (/design|ui|ux|brand|consist|redesign/.test(s)) return 'Craft & Design';
        if (/ship|launch|release|deliver|deadline|fix|built/.test(s)) return 'Execution';
        if (/metric|%|growth|adopt|number|revenue|saved/.test(s)) return 'Business Impact';
        if (/stakeholder|align|lead|team|present|mentor|partner/.test(s)) return 'Influence';
        if (/learn|study|risk|tradeoff|decided/.test(s)) return 'Judgment';
        return 'Ownership';
    }
    function reflect(t) {
        return `This local walkthrough preserves your note. In the app, the model checks what it can support.`;
    }
    function submit() {
        const v = input.value.trim();
        if (!v || busy) return;
        busy = true;
        btn.disabled = true;
        scrollBox.setAttribute('aria-busy', 'true');
        n++;
        const entry = document.createElement('div');
        entry.className = 'adv-entry';
        entry.id = `adv-note-${n}`;
        entry.tabIndex = -1;
        entry.innerHTML = `<p class="ae-text"><sup>${n}</sup>${esc(v)}</p><p class="ae-reflect"></p>
            <div class="adv-meta"><span class="adv-time">just now</span><span class="adv-comp">${compFor(v)}</span></div>`;
        scrollBox.appendChild(entry);
        showSource(entry);
        requestAnimationFrame(() => entry.classList.add('show'));
        input.value = '';
        scrollBox.scrollTop = 0;
        const refl = entry.querySelector('.ae-reflect');
        const text = reflect(v);
        refl.textContent = text;
        entry.querySelector('.adv-comp').classList.add('show');
        const line = document.createElement('div');
        line.className = 'as-line saved-note-result';
        line.innerHTML = `<span class="saved-note-label">Saved as a note</span><sup>${citation(n)}</sup>${esc(v)}`;
        story.appendChild(line);
        requestAnimationFrame(() => { line.classList.remove('new'); story.scrollTop = story.scrollHeight; });
        scrollBox.scrollTop = 0;
        busy = false;
        btn.disabled = false;
        scrollBox.setAttribute('aria-busy', 'false');
    }
    btn.addEventListener('click', submit);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
})();

// Authored answers share the quote line/flap treatment in a stable-height stage.
(function () {
    const thread = document.getElementById('imThread');
    const chips = [...document.querySelectorAll('.im-chip')];
    const replies = {
        hire: 'I sweat the details, use the tools myself, and keep the user at the center.',
        tech: 'Apple and Tesla are the two rabbit holes friends and teammates reliably ask me about. Usually it starts with a piece of news and turns into tech advice.',
        respect: 'Visible passion for the craft. I respect people who care deeply about what they’re making.'
    };
    if (!thread || !chips.length) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const panels = chips.map(chip => {
        const panel = document.createElement('div');
        panel.className = 'answer-panel';
        const paragraph = document.createElement('p');
        paragraph.textContent = replies[chip.dataset.q];
        panel.append(paragraph); return panel;
    });
    thread.replaceChildren(...panels);
    thread.setAttribute('aria-atomic', 'true');
    let current = 0, lineWidth = 0, run = 0;
    const animations = new Set();
    function cancel() { animations.forEach(animation => animation.cancel()); animations.clear(); }
    function settle() {
        run++; cancel();
        panels.forEach((panel, index) => {
            panel.toggleAttribute('data-current', index === current);
            panel.removeAttribute('data-leaving');
            panel.setAttribute('aria-hidden', String(index !== current));
        });
    }
    function typesetLines(force = false) {
        const width = Math.round(thread.clientWidth);
        if (!width || (!force && width === lineWidth)) return;
        lineWidth = width; settle();
        panels.forEach((panel, index) => {
            const paragraph = panel.querySelector('p');
            const words = replies[chips[index].dataset.q].split(' ').map((word, i, all) => {
                const span = document.createElement('span');
                span.textContent = word + (i < all.length - 1 ? ' ' : '');
                span.style.display = 'inline-block'; span.style.whiteSpace = 'pre';
                return span;
            });
            paragraph.replaceChildren(...words);
            const lines = [];
            words.forEach(word => {
                const top = Math.round(word.getBoundingClientRect().top);
                if (!lines.length || Math.abs(lines.at(-1).top - top) > 3) lines.push({ top, words:[] });
                lines.at(-1).words.push(word.textContent);
            });
            paragraph.replaceChildren(...lines.map(line => {
                const window = document.createElement('span'); window.className = 'quote-line';
                const ink = document.createElement('span'); ink.className = 'quote-line-ink';
                ink.textContent = line.words.join(''); window.append(ink); return window;
            }));
        });
        // Reserve the longest real answer. Tab switches cannot move the footer.
        thread.style.minHeight = Math.ceil(Math.max(matchMedia('(max-width:700px)').matches ? 130 : 150,
            ...panels.map(panel => panel.querySelector('p').getBoundingClientRect().height))) + 'px';
    }
    function animate(line, frames, timing) {
        const animation = line.animate(frames, { ...timing, fill:'both' });
        animations.add(animation);
        return animation.finished.catch(() => {});
    }
    function show(chip) {
        const next = chips.indexOf(chip);
        if (next === current) return;
        const previous = current;
        // Sample before cancellation so a quick reversal continues from the visible pose.
        const poses = new Map();
        panels.filter(panel => panel.hasAttribute('data-current') || panel.hasAttribute('data-leaving')).forEach(panel => {
            panel.querySelectorAll('.quote-line-ink').forEach(line => {
                const style = getComputedStyle(line); poses.set(line, { transform:style.transform, opacity:style.opacity });
            });
        });
        current = next; settle();
        chips.forEach((item, index) => item.setAttribute('aria-pressed', String(index === current)));
        if (reduced.matches) return;
        const outgoing = panels[previous], incoming = panels[current], token = run;
        outgoing.setAttribute('data-leaving', '');
        const jobs = [];
        outgoing.querySelectorAll('.quote-line-ink').forEach((line, i) => jobs.push(animate(line, [
            poses.get(line) || { transform:'none', opacity:1 },
            { transform:'translateY(-65%) rotateX(65deg)', opacity:0 }
        ], { duration:180, delay:i * 18, easing:'cubic-bezier(.4,0,1,1)' })));
        incoming.querySelectorAll('.quote-line-ink').forEach((line, i) => jobs.push(animate(line, [
            poses.get(line) || { transform:'translateY(70%) rotateX(-65deg)', opacity:0 },
            { transform:'none', opacity:1 }
        ], { duration:420, delay:100 + i * 35, easing:'cubic-bezier(.16,1,.3,1)' })));
        Promise.all(jobs).then(() => { if (token === run) settle(); });
    }
    chips.forEach(chip => chip.addEventListener('click', () => show(chip)));
    reduced.addEventListener('change', settle);
    document.addEventListener('visibilitychange', () => { if (document.hidden) settle(); });
    addEventListener('pagehide', settle);
    new ResizeObserver(() => typesetLines()).observe(thread);
    document.fonts.ready.then(() => typesetLines(true));
    typesetLines(); settle();
})();

// ── quote rotator ──
(function () {
    const quotes = [
        ['"Ghazi has been the most proactive of any team I\'ve collaborated with."', 'MEGAN WISER · PDP MENTEE'],
        ['"This is exactly how we should be operating."', 'SENIOR RISK LEADERSHIP · CAPITAL ONE'],
        ['"I could trust you to do what needed to be done."', 'SEAN WEBB · PRODUCT PARTNER'],
        ['"His thoughtful, customer-first approach was instrumental."', 'DREW MAGYAR · PRODUCT TEAM'],
        ['"Myriad contributions that propelled the initiative forward."', 'RACHEL RIQUE · MANAGER'],
    ];
    const stage = document.getElementById('quoteStage');
    quotes.forEach(([q, a], i) => {
        const d = document.createElement('div');
        d.className = 'q-item' + (i === 0 ? ' on' : '');
        d.innerHTML = `<p>${q}</p><cite>— ${a}</cite>`;
        stage.appendChild(d);
    });
    let cur = 0, timer, inView = false, paused = false, lineWidth = 0;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const items = [...stage.querySelectorAll('.q-item')];
    const pause = document.querySelector('.quote-pause');
    function typesetLines() {
        const width = Math.round(stage.clientWidth);
        if (!width || width === lineWidth) return;
        lineWidth = width;
        items.forEach((item, index) => {
            const paragraph = item.querySelector('p');
            const words = quotes[index][0].split(' ').map((word, i, all) => {
                const span = document.createElement('span');
                span.textContent = word + (i < all.length - 1 ? ' ' : '');
                span.style.display = 'inline-block';
                span.style.whiteSpace = 'pre';
                return span;
            });
            paragraph.replaceChildren(...words);
            const lines = [];
            words.forEach(word => {
                const top = Math.round(word.getBoundingClientRect().top);
                if (!lines.length || Math.abs(lines.at(-1).top - top) > 3) lines.push({ top, words:[] });
                lines.at(-1).words.push(word.textContent);
            });
            paragraph.replaceChildren(...lines.map(line => {
                const window = document.createElement('span');
                window.className = 'quote-line';
                const ink = document.createElement('span');
                ink.className = 'quote-line-ink';
                ink.textContent = line.words.join('');
                window.append(ink);
                return window;
            }));
        });
    }
    const show = (previous = -1) => {
        items.forEach((item, i) => {
            item.getAnimations({ subtree:true }).forEach(animation => animation.cancel());
            item.classList.toggle('on', i === cur);
            item.setAttribute('aria-hidden', String(i !== cur));
        });
        document.querySelector('.quote-position').textContent = `0${cur + 1} / 0${items.length}`;
        if (previous < 0 || reduced.matches) return;
        const outgoing = items[previous], incoming = items[cur];
        outgoing.animate([{ opacity:1 }, { opacity:1 }], { duration:220 });
        outgoing.querySelectorAll('.quote-line-ink').forEach((line, i) => line.animate([
            { transform:'none', opacity:1 },
            { transform:'translateY(-65%) rotateX(65deg)', opacity:0 }
        ], { duration:180, delay:i * 18, fill:'both', easing:'cubic-bezier(.4,0,1,1)' }));
        incoming.querySelectorAll('.quote-line-ink').forEach((line, i) => line.animate([
            { transform:'translateY(70%) rotateX(-65deg)', opacity:0 },
            { transform:'none', opacity:1 }
        ], { duration:420, delay:100 + i * 35, fill:'both', easing:'cubic-bezier(.16,1,.3,1)' }));
        outgoing.querySelector('cite').animate([{ opacity:1 }, { opacity:0 }], { duration:140, fill:'both' });
        incoming.querySelector('cite').animate([{ opacity:0 }, { opacity:1 }], { duration:250, delay:230, fill:'both' });
    };
    function schedule() {
        clearTimeout(timer);
        if (!inView || paused || document.hidden) return;
        timer = setTimeout(() => { const previous = cur; cur = (cur + 1) % items.length; show(previous); schedule(); }, 3300);
    }
    pause.addEventListener('click', () => {
        paused = !paused;
        const action = paused ? 'Resume quote rotation' : 'Pause quote rotation';
        pause.setAttribute('aria-label', action); pause.title = action;
        pause.querySelector('path').setAttribute('d', paused ? 'M8 5l11 7-11 7Z' : 'M8 5v14M16 5v14');
        pause.setAttribute('aria-pressed', String(paused));
        schedule();
    });
    const card = stage.closest('.c-quote');
    document.addEventListener('visibilitychange', schedule);
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; schedule(); }, { threshold: .15, rootMargin: '-72px 0px 0px' }).observe(card);
    reduced.addEventListener('change', () => show());
    new ResizeObserver(() => { typesetLines(); }).observe(stage);
    document.fonts.ready.then(() => { lineWidth = 0; typesetLines(); });
    typesetLines();
    show();
})();

// ── catalog rail reveal ──
(function () {
    const rows = document.querySelectorAll('.h-row');
    if (!rows.length) return;
    const obs = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
    }), { threshold: 0.3 });
    rows.forEach((r, i) => {
        r.style.transitionDelay = (i % 4) * 0.06 + 's';
        obs.observe(r);
    });
})();

// ── severance egg: the cold open ──
(function () {
    let n = 0, t;
    const name = document.querySelector('.nav .name');
    name.addEventListener('click', () => {
        clearTimeout(t); n++;
        if (n >= 5) {
            n = 0;
            const overlay = document.createElement('dialog');
            overlay.setAttribute('aria-label', 'A Severance surprise');
            const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;height:100dvh;background:#fff;z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;transition:opacity 0.8s;padding:24px;text-align:center;border:0;max-width:none;max-height:none;margin:0;';
            const lines = [
                { text: 'Who are you?', delay: 800, style: "font-family:'Spline Sans Mono',monospace;font-size:13px;color:#666;letter-spacing:0.22em;text-transform:uppercase;margin-bottom:30px;" },
                { text: 'Ghazi A.', delay: 2000, style: "font-family:'Bricolage Grotesque',sans-serif;font-size:clamp(32px,7vw,52px);font-weight:800;color:#141310;letter-spacing:-0.03em;margin-bottom:10px;" },
                { text: 'Your outie ships products.', delay: 3300, style: "font-family:'Fraunces',Georgia,serif;font-style:italic;font-size:clamp(16px,4vw,19px);color:#96342b;margin-bottom:38px;" },
                { text: 'Please enjoy each section equally.', delay: 4600, style: "font-family:'Spline Sans Mono',monospace;font-size:11.5px;color:#666;letter-spacing:0.08em;" }
            ];
            document.body.appendChild(overlay);
            overlay.showModal();
            requestAnimationFrame(() => overlay.style.opacity = '1');
            lines.forEach(l => {
                const el = document.createElement('div');
                el.style.cssText = l.style + 'opacity:0;transform:translateY(10px);transition:opacity 0.6s,transform 0.6s;';
                el.textContent = l.text;
                overlay.appendChild(el);
                setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, reduced ? 0 : l.delay);
            });
            const dismiss = document.createElement('button');
            dismiss.type = 'button';
            dismiss.textContent = 'Return to the portfolio';
            dismiss.style.cssText = "margin-top:30px;padding:12px 18px;background:none;border:1px solid #777;color:#333;font:13px 'DM Sans',sans-serif;cursor:pointer";
            overlay.appendChild(dismiss);
            dismiss.focus();
            if (reduced) overlay.style.transition = 'none';
            const end = setTimeout(() => overlay.close(), 7600);
            dismiss.addEventListener('click', () => overlay.close());
            overlay.addEventListener('close', () => {
                clearTimeout(end);
                overlay.remove();
                name.focus();
            }, { once: true });
        }
        t = setTimeout(() => n = 0, 900);
    });
})();

// ── surge narration (wired to the loopgrid) ──
(function () {
    const zone = document.querySelector('#work .process-zone');
    if (!zone) return;
    const q = s => document.querySelector(s);
    const nodesEls = {
        generator: zone.querySelector('.lg-gen'),
        orchestrator: zone.querySelector('.lg-orch'),
        auditor: zone.querySelector('.lg-aud'),
        implementer: zone.querySelector('.lg-imp'),
        human: zone.querySelector('.lg-pm')
    };
    if (Object.values(nodesEls).some(el => !el)) return;
    const gridEl = zone.querySelector('.loopgrid');
    const svgEl = zone.querySelector('.lg-wires');
    const ringEl = zone.querySelector('.lg-ring');
    const chipCount = zone.querySelector('.lg-count');
    const storyEl = q('#fuseStory');
    const runBtn = q('#runBtn'), runIcon = q('#runIcon'), runLabel = q('#runLabel');
    const compValN = q('#compValN'), compWasN = q('#compWasN');
    const timeValN = q('#timeValN'), timeUnitN = q('#timeUnitN'), timeWasN = q('#timeWasN');
    const repoNum = q('#repoNum');

    // ── connectors: drawn between live node boxes, flow direction = path direction ──
    const WIRE_DEFS = [
        { key: 'gen', from: 'generator', to: 'orchestrator', curve: 0 },
        { key: 'audOut', from: 'orchestrator', to: 'auditor', curve: 0 },
        { key: 'audBack', from: 'auditor', to: 'orchestrator', curve: -0.36, hidden: true },
        { key: 'impOut', from: 'auditor', to: 'implementer', curve: 0 },
        { key: 'impBack', from: 'implementer', to: 'orchestrator', curve: 0.36 },
        { key: 'pm', from: 'implementer', to: 'human', curve: 0, human: true },
    ];
    const wires = {};
    WIRE_DEFS.forEach(def => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        if (def.human) path.classList.add('human');
        if (def.hidden) path.style.display = 'none';
        svgEl.appendChild(path);
        def.el = path;
        wires[def.key] = def;
    });

    function drawWires() {
        if (!gridEl) return;
        const gr = gridEl.getBoundingClientRect();
        if (!gr.width) return;
        svgEl.setAttribute('viewBox', `0 0 ${gr.width} ${gr.height}`);
        const C = {};
        Object.entries(nodesEls).forEach(([k, el]) => {
            const r = el.getBoundingClientRect();
            C[k] = { x: r.left - gr.left + r.width / 2, y: r.top - gr.top + r.height / 2 };
        });
        WIRE_DEFS.forEach(def => {
            const A = C[def.from], B = C[def.to];
            let d;
            if (def.key === 'impBack') {
                const side = gr.width - 12;
                d = `M ${A.x} ${A.y} H ${side - 14} Q ${side} ${A.y} ${side} ${A.y - 14} V ${B.y + 14} Q ${side} ${B.y} ${side - 14} ${B.y} H ${B.x}`;
            } else if (def.curve) {
                const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
                const nx = -(B.y - A.y), ny = (B.x - A.x);
                const nl = Math.hypot(nx, ny) || 1;
                const off = def.curve * Math.hypot(B.x - A.x, B.y - A.y) * 0.28;
                d = `M ${A.x} ${A.y} Q ${mx + nx / nl * off} ${my + ny / nl * off} ${B.x} ${B.y}`;
            } else {
                d = `M ${A.x} ${A.y} L ${B.x} ${B.y}`;
            }
            def.el.setAttribute('d', d);
        });
    }
    drawWires();
    window.addEventListener('resize', drawWires);
    setTimeout(drawWires, 300);
    setTimeout(drawWires, 1200);

    const phases = [
        {
            nodes: ['generator'], wires: ['gen'], chip: false, human: false,
            text: 'First, a one-time setup. <strong>The Generator</strong> reads the design system and writes a logic-aware spec sheet for every component: the rules to follow, and the deep API logic to never touch.'
        },
        {
            nodes: ['orchestrator'], wires: [], chip: false, human: false,
            text: '<strong>The Orchestrator</strong> takes those specs and runs the show, breaking the work into tasks and handing them out.'
        },
        {
            nodes: ['orchestrator', 'auditor', 'implementer'], wires: ['audOut', 'audBack', 'impOut', 'impBack'], chip: true, human: false,
            text: '<strong>The Auditor</strong> flags every drift from spec; <strong>the Implementer</strong> fixes only what it\'s allowed to. Both report back through the orchestrator — pass after pass — until the code is compliant.'
        },
        {
            nodes: ['human'], wires: ['pm'], chip: true, human: true,
            text: 'Then it reports out to <strong>you</strong>. You set the guardrails, review each pass, approve the merge. Agents on the tools, the PM on the rulebook.'
        }
    ];

    let running = false;
    const wait = ms => new Promise(r => setTimeout(r, ms));

    function animateNumber(el, to, dur) {
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = to; return; }
        const t0 = performance.now();
        (function tick(now) {
            const p = Math.min((now - t0) / dur, 1);
            el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(tick);
        })(performance.now());
    }

    function clearActive() {
        Object.values(nodesEls).forEach(n => n.classList.remove('lit'));
        Object.values(wires).forEach(w => w.el.classList.remove('on'));
        if (ringEl) ringEl.classList.remove('lit', 'tick');
        storyEl.classList.remove('human');
    }

    function reset() {
        clearActive();
        Object.values(nodesEls).forEach(n => n.classList.remove('done'));
        compValN.textContent = '28';
        compWasN.style.visibility = 'hidden';
        timeValN.textContent = '<1'; timeUnitN.textContent = 'day';
        timeValN.style.opacity = 1; timeUnitN.style.opacity = 1;
        timeWasN.textContent = ''; timeWasN.style.visibility = 'visible';
        repoNum.textContent = '0';
        if (chipCount) chipCount.textContent = '×n';
    }

    function restore() {
        compValN.textContent = '92';
        compWasN.style.visibility = 'visible';
        timeValN.textContent = '<1'; timeUnitN.textContent = 'day';
        timeValN.style.opacity = 1; timeUnitN.style.opacity = 1;
        timeWasN.textContent = '';
        repoNum.textContent = '4';
        if (chipCount) chipCount.textContent = '×4';
    }

    // ── scoreboard ticks up the first time it scrolls into view ──
    [timeValN, timeUnitN].forEach(el => { el.style.transition = 'opacity 0.25s ease'; });

    function setTime(flipped) {
        timeValN.style.opacity = 0;
        timeUnitN.style.opacity = 0;
        setTimeout(() => {
            timeValN.textContent = '<1';
            timeUnitN.textContent = 'day';
            timeValN.style.opacity = 1;
            timeUnitN.style.opacity = 1;
        }, 260);
    }

    function popRing() {
        if (!ringEl) return;
        ringEl.classList.remove('tick');
        void ringEl.offsetWidth;
        ringEl.classList.add('tick');
    }

    // chip count is run-state only — arriving at the section must not tick it
    function popCount(n) {
        if (chipCount) chipCount.textContent = '×' + n;
        popRing();
    }

    async function runPhase(p, i) {
        clearActive();
        phases.slice(0, i).forEach(pp => pp.nodes.forEach(n => nodesEls[n].classList.add('done')));
        p.nodes.forEach(n => nodesEls[n].classList.add('lit'));
        p.wires.forEach(w => wires[w] && wires[w].el.classList.add('on'));
        if (p.chip && ringEl) ringEl.classList.add('lit');
        storyEl.classList.toggle('human', p.human);
        storyEl.style.opacity = 0;
        await wait(240);
        storyEl.innerHTML = p.text;
        storyEl.style.opacity = 1;
        if (i === 2) {
            animateNumber(compValN, 92, 2600);
            setTimeout(() => { compWasN.style.visibility = 'visible'; }, 1400);
            for (let k = 1; k <= 4; k++) setTimeout(() => { repoNum.textContent = k; popCount(k); }, 700 + k * 650);
            setTimeout(() => {
                setTime(true);
                timeWasN.textContent = '';
            }, 2100);
        }
        await wait(i === 2 ? 5400 : 4300);
    }

    async function run() {
        if (running) return;
        running = true;
        runBtn.disabled = true;
        runIcon.textContent = '';
        runLabel.textContent = 'Running…';
        reset();
        await wait(420);
        for (let i = 0; i < phases.length; i++) await runPhase(phases[i], i);
        clearActive();
        Object.values(nodesEls).forEach(n => n.classList.add('done'));
        ['audOut', 'audBack', 'impOut', 'impBack', 'pm'].forEach(w => wires[w].el.classList.add('on'));
        restore();
        storyEl.style.opacity = 0;
        await wait(240);
        storyEl.innerHTML = 'The pilot delivered <strong>28% → 92%</strong> on-spec across four codebases. Audit and code changes took under a day, before review and deployment. Leadership assigned a dedicated team to take the approach across the org.';
        storyEl.style.opacity = 1;
        runBtn.disabled = false;
        runIcon.textContent = '▶';
        runLabel.textContent = 'Run it again';
        running = false;
    }

    if (runBtn) {
        runBtn.addEventListener('click', run);
        const hoverText = {
            generator: '<strong>The Generator</strong>: a one-time setup that reads the design system and writes a logic-aware spec sheet per component.',
            orchestrator: '<strong>The Orchestrator</strong>: the hub. Breaks work into tasks, dispatches to the auditor and implementer, reports out to you.',
            auditor: '<strong>The Auditor</strong>: scans the codebases and flags every place the UI drifts from spec. Loops back through the orchestrator.',
            implementer: '<strong>The Implementer</strong>: makes the changes the spec allows; deep business logic stays fenced off.',
            human: '<strong>You, the PM</strong>: set the guardrails, review each pass, approve the merge. The human in the loop.'
        };
        Object.entries(nodesEls).forEach(([k, el]) => {
            el.tabIndex = 0;
            const explain = () => {
                if (running) return;
                storyEl.style.opacity = 0;
                setTimeout(() => { storyEl.innerHTML = hoverText[k]; storyEl.style.opacity = 1; }, 120);
            };
            el.addEventListener('mouseenter', explain);
            el.addEventListener('focus', explain);
        });
    }
})();

// ── neon signature (v5 skeleton-mask sequence) ──
(function () {
    const plaque = document.getElementById('sigPlaque');
    const svg = document.getElementById('sigSvg');
    if (!plaque || !svg) return;

    const strokes = [
        { id: 'skG', dur: 1000, gap: 100 },   // G sweep
        { id: 'skH1', dur: 200, gap: 40 },    // h left ↓
        { id: 'skH2', dur: 200, gap: 40 },    // h right ↓
        { id: 'skA', dur: 280, gap: 40 },     // a ↗↘
        { id: 'skZ', dur: 280, gap: 40 },     // z loop ↓
        { id: 'skI', dur: 160, gap: 0 },      // i ↓
    ];

    strokes.forEach(s => {
        s.el = document.getElementById(s.id);
        if (!s.el) return;
        s.len = s.el.getTotalLength();
        s.el.style.strokeDasharray = s.len;
        s.el.style.strokeDashoffset = 0;
    });

    const gapEl = document.getElementById('skGap');
    let gapLen = 0;
    if (gapEl) {
        gapLen = gapEl.getTotalLength();
        gapEl.style.strokeDasharray = gapLen;
        gapEl.style.strokeDashoffset = 0;
    }

    function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    let sequence = 0;
    function animateStroke(s, cb) {
        const version = sequence;
        if (!s.el) { if (cb) cb(); return; }
        const easeFn = s === strokes[0] ? easeInOutCubic : easeOutCubic;
        const start = performance.now();
        (function tick(now) {
            if (version !== sequence) return;
            const t = Math.min((now - start) / s.dur, 1);
            const eased = easeFn(t);
            s.el.style.strokeDashoffset = s.len * (1 - eased);
            if (s === strokes[0] && gapEl) gapEl.style.strokeDashoffset = gapLen * (1 - eased);
            if (t < 1) requestAnimationFrame(tick);
            else if (cb) cb();
        })(performance.now());
    }

    let playing = false;
    function runSequence(i, version = sequence) {
        if (version !== sequence) return;
        if (i >= strokes.length) {
            setTimeout(() => { if (version !== sequence) return; svg.classList.add('neon-on'); playing = false;
                setTimeout(() => { if (version === sequence) svg.classList.remove('neon-on'); }, 2800);
            }, 120);
            return;
        }
        animateStroke(strokes[i], () => setTimeout(() => runSequence(i + 1, version), strokes[i].gap));
    }

    function play() {
        if (playing) return;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
            strokes.forEach(s => { if (s.el) s.el.style.strokeDashoffset = 0; });
            if (gapEl) gapEl.style.strokeDashoffset = 0;
            return;
        }
        playing = true;
        sequence++;
        svg.classList.remove('neon-on');
        strokes.forEach(s => {
            if (!s.el) return;
            s.el.style.strokeDasharray = s.len;
            s.el.style.strokeDashoffset = s.len;
        });
        if (gapEl) gapEl.style.strokeDashoffset = gapLen;
        runSequence(0);
    }

    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => {
        if (!event.matches) return;
        sequence++;
        playing = false;
        svg.classList.remove('neon-on');
        play();
    });
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) play();
    let triggered = false;
    const io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting && !triggered) {
            triggered = true;
            io.disconnect();
            play();
        }
    }), { threshold: 0.4 });
    io.observe(plaque);

    plaque.addEventListener('mouseenter', () => { if (triggered) play(); });
    plaque.addEventListener('click', play);
    plaque.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); play(); }
    });
})();

// ── listening · side a ──
// Preview playback begins with the sleeve gesture; handling stays silent until
// the disc is on the platter and the needle has lowered.
(function () {
    const TRACKS = [
        { artist: 'Tame Impala', song: 'Let It Happen', artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a8/2e/b4/a82eb490-f30a-a321-461a-0383c88fec95/15UMGIM23316.rgb.jpg/300x300bb.jpg', color: '#7B5EA7', album: 'Currents', q: 'tame impala let it happen', src: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/8d/60/fb/8d60fb3b-208b-70db-f712-801034be3130/mzaf_14872027621360090334.plus.aac.p.m4a' },
        { artist: 'Beach House', song: 'Lemon Glow', artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/59/90/0c/59900c7a-1e05-4048-6a0b-830bd0f6cbc7/Beach_House_7_Cover_3000x3000_300.jpg/300x300bb.jpg', color: '#C9972C', album: '7', q: 'beach house lemon glow', src: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/61/2f/6e/612f6e2d-3f18-ece6-d77b-99a33d408052/mzaf_5709031647347199909.plus.aac.p.m4a' },
        { artist: 'Daft Punk', song: 'Veridis Quo', artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/fd/4a/77/fd4a77db-0ebc-d043-41a2-f32fa1bb0fb4/dj.qrikkdwj.jpg/300x300bb.jpg', color: '#46586B', album: 'Discovery', q: 'daft punk veridis quo', src: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/7a/f8/4d/7af84d3a-fc7b-1569-766b-8adf13dab451/mzaf_3503155761614342520.plus.aac.p.m4a' }
    ];
    const platter = document.getElementById('vPlatter');
    const label = document.getElementById('vLabel');
    const arm = document.getElementById('vArm');
    const tracksEl = document.getElementById('vTracks');
    const np = document.getElementById('vNp');
    const npTitle = document.getElementById('vNpTitle');
    const npSub = document.getElementById('vNpSub');
    const stopButton = document.getElementById('vNpBtn');
    if (!platter || !tracksEl || !np) return;
    const carrier = platter.parentElement;
    const recordCard = tracksEl.closest('.c-vinyl');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const LEVEL = .85, ATTACK = 900, RELEASE = 600, SWITCH_RELEASE = 650;
    let current = -1, selected = -1, state = 'empty', serial = 0, landing, transfer, phase = 'rest', ticket;
    const soundIntent = TRACKS.map(() => false);
    const audioVersion = TRACKS.map(() => 0);
    const endFading = TRACKS.map(() => false);
    const audio = TRACKS.map((track, index) => {
        const element = new Audio();
        element.preload = 'none'; element.src = track.src; element.volume = 0;
        element.dataset.recordAudio = String(index);
        recordCard.append(element);
        return element;
    });
    const fades = new WeakMap();
    function cancelFade(element) {
        const active = fades.get(element);
        if (active) cancelAnimationFrame(active.frame);
        fades.delete(element);
    }
    function fade(element, to, duration, done) {
        // A timeupdate must not restart the same release envelope every 250ms.
        const previous = fades.get(element);
        if (previous?.to === to) { if (done) previous.done.push(done); return; }
        cancelFade(element);
        const from = element.volume, start = performance.now(), active = { to, frame: 0, done: done ? [done] : [] };
        const tick = now => {
            if (fades.get(element) !== active) return;
            const progress = Math.min(1, (now - start) / duration);
            const eased = progress * progress * (3 - 2 * progress);
            element.volume = Math.max(0, Math.min(1, from + (to - from) * eased));
            if (progress < 1) active.frame = requestAnimationFrame(tick);
            else { fades.delete(element); active.done.forEach(finish => finish()); }
        };
        fades.set(element, active);
        active.frame = requestAnimationFrame(tick);
    }
    function releaseAudio(index, duration = RELEASE, rewind = false) {
        const element = audio[index];
        soundIntent[index] = false; ++audioVersion[index];
        const finish = () => {
            if (soundIntent[index]) return;
            element.pause();
            if (rewind) element.currentTime = 0;
        };
        if (element.volume < .001 || element.paused) {
            cancelFade(element); element.volume = 0; finish();
        } else fade(element, 0, duration, finish);
    }
    function playRequest(index, resume = false) {
        const element = audio[index], version = ++audioVersion[index];
        soundIntent[index] = true; endFading[index] = false;
        if (resume) cancelFade(element);
        // Called synchronously from the click, including on Safari: the promise
        // is retained while the physical sequence runs. Never start on load.
        try {
            return Promise.resolve(element.play()).then(() => {
                if (!soundIntent[index]) { element.pause(); return false; }
                return version === audioVersion[index];
            }, () => false);
        } catch (_) { return Promise.resolve(false); }
    }
    let previewsRequested = false;
    function requestPreviews() {
        if (previewsRequested) return;
        previewsRequested = true;
        TRACKS.forEach((track, index) => {
            fetch('https://itunes.apple.com/search?term=' + encodeURIComponent(track.q) + '&entity=song&limit=8')
                .then(response => response.ok ? response.json() : null)
                .then(data => {
                    if (!data?.results || current === index || selected === index || soundIntent[index] || !audio[index].paused) return;
                    const hits = data.results.filter(item => item.previewUrl && item.trackName?.toLowerCase() === track.song.toLowerCase());
                    const match = hits.find(item => item.collectionName?.toLowerCase().includes(track.album.toLowerCase())) || hits[0];
                    if (match) audio[index].src = match.previewUrl;
                }).catch(() => {});
        });
    }
    recordCard.addEventListener('pointerenter', requestPreviews, { once: true });
    recordCard.addEventListener('focusin', requestPreviews, { once: true });
    TRACKS.forEach((track, index) => {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'v-track';
        button.innerHTML = `<span class="sleeve"><img src="${track.artwork}" alt="" width="300" height="300" loading="lazy"></span><span class="vt-info"><strong>${track.song}</strong><small>${track.artist}</small></span>`;
        button.addEventListener('click', () => selectRecord(index));
        tracksEl.append(button);
        const element = audio[index];
        element.addEventListener('timeupdate', () => {
            if (current !== index || !Number.isFinite(element.duration)) return;
            arm.style.setProperty('--groove-travel', `${Math.min(1, element.currentTime / element.duration) * 6}deg`);
            const remaining = element.duration - element.currentTime;
            if (state === 'playing' && remaining <= 1.2 && !endFading[index]) {
                endFading[index] = true;
                fade(element, 0, Math.max(100, Math.min(1100, remaining * 1000)));
            }
        });
        element.addEventListener('ended', () => {
            if (current !== index || selected !== index || state !== 'playing') return;
            cancelFade(element); element.volume = 0; soundIntent[index] = false; ++audioVersion[index];
            ++serial; clearTimeout(landing); state = 'ended'; render();
            npSub.textContent = 'Preview finished.';
        });
    });
    const buttons = [...tracksEl.children];
    function render() {
        const down = state === 'playing' || state === 'starting';
        platter.classList.toggle('spin', down);
        arm.classList.toggle('on', down);
        arm.setAttribute('aria-pressed', String(down)); platter.setAttribute('aria-pressed', String(down));
        const action = down ? 'Pause preview' : state === 'ended' ? 'Replay selected record' : 'Play selected record';
        arm.setAttribute('aria-label', action); arm.title = action; platter.setAttribute('aria-label', action);
        recordCard.dataset.deckState = state;
        arm.disabled = platter.disabled = current < 0 || state === 'loading';
        stopButton.disabled = (current < 0 && selected < 0) || state === 'loaded';
        buttons.forEach((button, index) => {
            const chosen = selected === index;
            button.classList.toggle('selected', chosen); button.setAttribute('aria-pressed', String(chosen));
            button.setAttribute('aria-label', `${chosen ? (state === 'loading' ? 'Putting on' : down ? 'Pause' : 'Play') : 'Put on and play'} ${TRACKS[index].song} by ${TRACKS[index].artist}`);
        });
    }
    function setArtwork(index) {
        label.style.backgroundColor = TRACKS[index].color;
        label.style.backgroundImage = `url("${TRACKS[index].artwork}")`;
        carrier.dataset.record = String(index);
        npTitle.textContent = TRACKS[index].song + ' — ' + TRACKS[index].artist;
    }
    function freezeTransfer() {
        if (!transfer) return;
        // Commit the sampled on-screen transform BEFORE canceling the animation.
        // The next request starts here, rather than snapping to a keyframe.
        carrier.style.transform = getComputedStyle(carrier).transform;
        transfer.cancel(); transfer = null;
    }
    function sleevePoses(index) {
        const source = buttons[index].querySelector('.sleeve').getBoundingClientRect();
        const target = carrier.getBoundingClientRect();
        const matrix = new DOMMatrixReadOnly(getComputedStyle(carrier).transform);
        const width = parseFloat(getComputedStyle(carrier).width);
        const x = source.left + source.width / 2 - (target.left + target.width / 2 - matrix.m41);
        const y = source.top + source.height / 2 - (target.top + target.height / 2 - matrix.m42);
        const scale = source.width * .92 / width;
        return { home: { x, y, scale }, out: { x, y: y - source.height * 1.02, scale } };
    }
    const transform = pose => `translate(${pose.x}px,${pose.y}px) scale(${pose.scale})`;
    async function move(frames, duration, request, nextPhase) {
        phase = nextPhase; carrier.dataset.recordPhase = phase;
        if (reduced.matches) { carrier.style.transform = frames[frames.length - 1].transform; return request === serial; }
        const animation = carrier.animate(frames, { duration, easing: 'cubic-bezier(.22,.7,.18,1)', fill: 'both' });
        transfer = animation;
        try { await animation.finished; } catch (_) { return false; }
        if (request !== serial || transfer !== animation) return false;
        carrier.style.transform = frames[frames.length - 1].transform;
        transfer = null; animation.cancel(); return true;
    }
    async function returnRecord(request) {
        if (current < 0) return true;
        const { home, out } = sleevePoses(current);
        const matrix = new DOMMatrixReadOnly(getComputedStyle(carrier).transform);
        const onSleeveAxis = Math.abs(matrix.m41 - home.x) < 2 && Math.abs(matrix.a - home.scale) < .02 && matrix.m42 >= out.y - 2 && matrix.m42 <= home.y + 2;
        // A partially extracted/inserted disc reverses on its sleeve axis. A disc
        // elsewhere first approaches the sleeve's opening, then slides inside.
        if (!onSleeveAxis && !await move([
            { transform: getComputedStyle(carrier).transform },
            { transform: transform(out) }
        ], 410, request, 'returning')) return false;
        if (!await move([
            { transform: getComputedStyle(carrier).transform },
            { transform: transform(home) }
        ], 280, request, 'inserting')) return false;
        // The opaque original sleeve now covers the entire disc. Only here may
        // the carrier disappear or receive the next record's artwork.
        carrier.hidden = true; current = -1; return true;
    }
    function startPlayback(request, prepared, rewind) {
        if (request !== serial || current < 0 || prepared?.index !== current) return;
        const index = current, element = audio[index];
        prepared.ready.then(ok => {
            if (request !== serial || current !== index || selected !== index) return;
            if (!ok) {
                releaseAudio(index); np.classList.remove('sr-only'); state = 'loaded';
                npSub.textContent = 'Preview unavailable. Choose another record or try again.'; render(); return;
            }
            state = 'starting'; npSub.textContent = 'Starting preview…'; render();
            landing = setTimeout(() => {
                if (request !== serial || current !== index || selected !== index) return;
                if (rewind) element.currentTime = 0;
                endFading[index] = false; state = 'playing'; npSub.textContent = 'Playing preview.'; render();
                fade(element, LEVEL, ATTACK);
            }, reduced.matches ? 0 : 360);
        });
    }
    async function handleSelection(request) {
        if (!await returnRecord(request) || request !== serial) return;
        if (selected < 0) {
            phase = 'rest'; carrier.dataset.recordPhase = phase; state = 'empty'; render(); return;
        }
        current = selected; setArtwork(current); carrier.hidden = false;
        const { home, out } = sleevePoses(current);
        carrier.style.transform = transform(home);
        if (!await move([{ transform: transform(home) }, { transform: transform(out) }], 310, request, 'extracting')) return;
        if (!await move([{ transform: transform(out) }, { transform: 'none' }], 430, request, 'placing')) return;
        phase = 'rest'; carrier.dataset.recordPhase = phase;
        state = 'loaded'; render(); startPlayback(request, ticket, true);
    }
    function togglePlayback() {
        if (current < 0 || state === 'loading') return;
        const index = current, request = ++serial;
        clearTimeout(landing); np.classList.add('sr-only');
        if (state === 'playing' || state === 'starting') {
            state = 'paused'; npSub.textContent = 'Paused.'; render(); releaseAudio(index); return;
        }
        const rewind = state === 'ended' || state === 'loaded';
        if (rewind) audio[index].currentTime = 0;
        ticket = { index, ready: playRequest(index, true) };
        startPlayback(request, ticket, false);
    }
    function selectRecord(index) {
        if (index === selected) { togglePlayback(); return; }
        const request = ++serial;
        clearTimeout(landing); freezeTransfer();
        audio.forEach((_, other) => { if (other !== index) releaseAudio(other, SWITCH_RELEASE); });
        selected = index; np.classList.add('sr-only');
        // Preserve an already-running release if this record was selected again
        // during a rapid change; its sound reaches zero without an abrupt cut.
        if (audio[index].paused) { cancelFade(audio[index]); audio[index].volume = 0; audio[index].currentTime = 0; }
        ticket = { index, ready: playRequest(index) };
        state = 'loading'; arm.style.setProperty('--groove-travel', '0deg');
        npSub.textContent = 'Putting the record on…'; render();
        handleSelection(request);
    }
    function stop() {
        if (current < 0 && selected < 0) return;
        const request = ++serial, wasMoving = state === 'loading';
        clearTimeout(landing); freezeTransfer(); ticket = null;
        audio.forEach((_, index) => releaseAudio(index, RELEASE, true));
        np.classList.add('sr-only'); arm.style.setProperty('--groove-travel', '0deg'); npSub.textContent = 'Stopped.';
        if (wasMoving) {
            // Stop cancels a queued replacement. The disc in hand goes back into
            // its own sleeve from its sampled position; no new disc is pulled.
            selected = -1; state = 'loading'; render(); handleSelection(request);
        } else { state = 'loaded'; render(); }
    }
    reduced.addEventListener('change', () => {
        if (!reduced.matches || state !== 'loading') return;
        const request = ++serial; freezeTransfer();
        if (selected < 0) { carrier.hidden = true; current = -1; state = 'empty'; render(); return; }
        current = selected; setArtwork(current); carrier.hidden = false; carrier.style.transform = 'none';
        phase = 'rest'; carrier.dataset.recordPhase = phase; state = 'loaded'; render(); startPlayback(request, ticket, true);
    });
    arm.addEventListener('click', togglePlayback); platter.addEventListener('click', togglePlayback);
    stopButton.addEventListener('click', stop);
    carrier.hidden = true; render();
})();
