# HANDOVER — 17 Feb 2026

## 1. What the next session should do FIRST
- Build an interactive interview page (using frontend-design skill) to collect specific metrics from Ghazi: Capital One outcomes with qualifiers (e.g., "15%+ per assessment cycle"), WBD specific project outcomes, and more numbers throughout the portfolio.
- After collecting answers, update v5.html/index.html with the specific metrics.
- Run the 10-expert review panel targeting 95/100 (user's updated threshold).
- Address Tobias feedback: break standard page flow with a full-bleed image or interactive element; add subtle tilt/parallax to phone frames on scroll.

## 2. One thing the next session should NOT touch
Do NOT rewrite the case study copy for Capital One — it was corrected based on direct user feedback (scoping is a critical required module, not optional) and now includes real details from actual performance reviews (BPMN ownership, SECON presentation, mentoring). The testimonials are real quotes from named colleagues (Sawyer Strong, Sean Webb, Megan Wiser, Drew Magyar, Rachel Rique) — do not replace them with fabricated ones.

Do NOT change the color palette (terracotta #c87856 + sage teal #5b9e90). User explicitly approved it ("Love the color palette"). Do NOT use purple (feels "AI-basic") or cream+orange (feels like "Anthropic's site").

## 3. What we worked on / accomplished
Built Ghazi's PM portfolio from scratch across 5 major versions, deployed to GitHub Pages.

**Version history:**

1. **v1 (glass-gradient)**: Initial portfolio from resume data. Glass morphism, amber accent, standard PM layout. Tagged `v1-glass-gradient`. User feedback: "feels AI-built."

2. **v2 (editorial + bold personal)**: Rewrote copy using personality data from a vibe-check interview. Broke AI patterns (fewer em dashes, asymmetric layouts, natural voice). Added personality details (snowboarding, trading, Tame Impala, Tesla/SpaceX).

3. **v3 (expert-reviewed, score 90/100)**: Ran 4 rounds of 10-expert simulated panel. Scores: 74 -> 84 -> 88 -> 90. Added: 2-column hero with conviction card, Agent Manager thesis above fold, narrative case studies with tradeoffs/failures, animated accuracy visualization, dedicated Thesis section, scroll progress bar, OG meta tags.

4. **v4 (real feedback + visual overhaul)**: Incorporated user's direct feedback document. Replaced fabricated testimonials with real quotes from performance reviews. Fixed scoping description. Added real Tape screenshots. Added indigo secondary, gradient hero name, dual-color ambient glow. OG image. Fixed mobile nav. Deployed to GitHub Pages.

5. **v5 (complete rebuild — Editorial Warmth + Dark Kinetic hybrid)**:
   - **New font system**: Fraunces (editorial serif) + Syne (bold display) + Manrope (body) + IBM Plex Mono (labels)
   - **New color palette**: Terracotta #c87856 (primary) + sage teal #5b9e90 (secondary) — user-approved
   - **Dark mode default** with light mode toggle
   - **Personality injection**: Deep TypeForm-style 8-question interview (`briefing.html`), 3-way visual direction picker (`direction.html`)
   - **All 5 performance reviews** woven into case studies and testimonial marquee
   - **Personality details**: Hoverboard origin story, jailbreaking iPhones at 13, CS minor, App Store at 16, Beli food critic, Severance reference
   - **Severance easter egg**: Click nav name 5x for Lumon-themed overlay ("Who are you?" -> "Your outie is a product manager" -> "Please enjoy each section equally")
   - **Visual features**: Animated gradient hero name, cursor glow with lerp, CSS marquee testimonials (slows on hover instead of freezing), tooltip easter eggs on interest pills, sticky FAB, intersection observer animations
   - **v5.1 fixes** (from feedback.md): Conviction card readability, accuracy figures formatting, CS minor mention, restored "obsessed with products" paragraph + X plug, Syne multi-line headings split, Tape challenges detail, phone frame styling softened, Succession->Severance rename
   - **Copy editor pass**: Clean — only AI-flagged words are in real colleague quotes
   - **Expert panel Round 1**: Scored 91.1/100 (passed 90 threshold, targeting 95 next)

**Other work:**
- Set up git and GitHub for this repo (`GhaziAryan/portfolio`, public)
- Pushed Tape repo to GitHub (`GhaziAryan/Tape`, private)
- Installed `gh` CLI and authenticated
- Created interactive interview pages: `chat.html`, `vibe-check.html`, `setup.html`, `briefing.html`, `direction.html`
- Expert review pages: `review-r2.html`, `review-r3.html`, `review-final.html`, `review-v5.html`

## 4. What worked / didn't (bugs + fixes)

**Worked:**
- Vibe-check + briefing interviews captured Ghazi's real voice effectively
- Real performance review quotes (Sawyer, Sean, Megan, Drew, Rachel) are far more credible than fabricated testimonials
- Real Tape screenshots in iPhone frames with subtle tilt
- Terracotta + sage teal palette breaks AI-template look — user approved
- Fraunces + Syne + Manrope font stack feels editorial, not generic
- Dark mode default with proper light mode support
- Cursor glow effect and scroll animations add interactivity without gimmick
- Severance easter egg adds personality surprise
- Slowing marquee on hover (instead of pausing) prevents jarring freeze

**Known issues / fixes applied:**
- Conviction card text was unreadable: Fixed `color: var(--t2)` -> `color: var(--t)`, strong tags use `--accent`
- Accuracy figures (~40%, ~85%) looked like negative values: Removed tildes
- Marquee froze jarringly on hover: Changed to slow instead of pause
- "I don't code" gave wrong impression: Changed to mention CS minor + App Store at 16
- Syne font hard to read on multi-line headings: Split into headline + case-lede subtext
- Phone frames too aggressive: Reduced size, padding, border; softer shadows; added rotation tilt
- OG image URL hardcoded to `ghaziaryan.github.io/portfolio/` — needs updating if custom domain added

## 5. Key decisions and why
- **Single HTML file, no build tools**: Portfolio is one `index.html` with inline CSS/JS. Deploys anywhere, loads instantly.
- **Four-font system**: Fraunces (editorial quotes/accent), Syne (bold display headings), Manrope (body text), IBM Plex Mono (labels/technical). Each has a clear role.
- **Terracotta + sage teal**: Chosen to avoid AI-basic purple and Anthropic-like cream+orange. User explicitly approved.
- **Dark mode default**: User requested during direction selection. Light mode available via toggle.
- **Editorial Warmth (A) + Dark Kinetic (B) hybrid**: User liked A's warmth and conviction card, B's interactivity and boldness.
- **Real testimonials only**: All quotes attributed to real named colleagues from performance reviews.
- **Severance, not Succession**: User corrected the show reference — Severance is the one that resonates.
- **Copy editor as separate pass**: "Grizzled old man newspaper editor" critique runs AFTER writing, catches AI patterns, respects reader's time.
- **10-expert panel for portfolio only**: Not for interview pages. Panel includes iOS design, copywriting, psychology, CRO, founder perspective, etc.
- **GitHub Pages for hosting**: Free, deploys from repo, supports custom domains.

## 6. Lessons learned / gotchas
- Em dashes are the #1 AI tell in copy. User flagged this. Avoid them.
- Fabricated testimonials hurt more than they help. Real quotes with real names are always better.
- "Looks AI-generated" is about the full visual system, not just copy. Monochrome dark + glass cards + symmetric grids = AI template.
- User communicates exclusively via interactive webpages — all interviews, direction choosers, and review panels are HTML files.
- Tilde (~) before numbers can look like negative signs. Use "around" or just state the number.
- Display fonts (like Syne 800) become unreadable on multi-line text. Keep display text to single lines, use subheadings for detail.
- User has a CS minor and shipped to App Store at 16 — important to show technical credibility without claiming to be a coder.
- `gh api` JSON payloads need `--input -` with heredoc on zsh.
- Pillow install requires a venv on modern macOS.

## 7. Clear next steps
1. **Interview for specific metrics** — Capital One outcomes need qualifiers ("15%+ per assessment cycle"), WBD needs specific project outcome, add more numbers throughout
2. **Expert panel Round 2** — targeting 95/100 (user's updated threshold from feedback.md)
3. **Tobias feedback** — break standard page flow with full-bleed image or interactive element; phone frame parallax on scroll
4. **One more surprise** — user wants "one more true surprise hidden easter egg or interactive moment" beyond Severance
5. **Custom domain** — user wants a clean domain like `ghazi.co`. CNAME + DNS records for GitHub Pages.
6. **Update OG image URL** when custom domain is configured

## 8. Map of important files
| File | Role |
|------|------|
| `index.html` | The portfolio (copy of v5.html) — single-file, all CSS/JS inline |
| `v5.html` | v5 source (identical to index.html) |
| `og-image.png` | OG preview image (1200x630, dark card with name) |
| `Tape Screenshots/*.PNG` | 6 real Tape app screenshots (IMG_0414-0419) |
| `feedback.md` | User's feedback after v5.1 (remaining items to address) |
| `briefing.html` | v5 Phase 1: briefing + TypeForm-style 8-question interview |
| `direction.html` | v5 Phase 2: 3 live-rendered visual direction previews |
| `review-v5.html` | v5 expert panel Round 1 results (avg: 91.1, passed 90) |
| `v1.html` | Preserved v1 (glass gradient, pre-personality rewrite) |
| `chat.html` | v1-v4 initial interview page |
| `vibe-check.html` | v1-v4 personality interview |
| `setup.html` | v1-v4 diagnostics/direction chooser |
| `review-r2.html` through `review-final.html` | v3 expert panel results |
| `/Users/ghaziaryan/Downloads/interview-v5.json` | v5 personality interview answers |
| `/Users/ghaziaryan/Downloads/direction-v5.json` | v5 direction choice (A + notes) |
| `/Users/ghaziaryan/Downloads/# Performance Reviews...` | Real performance reviews from 5 colleagues |

## 9. Git state
- **Repo**: `github.com/GhaziAryan/portfolio` (public)
- **Branch**: `main`
- **Tags**: `v1-glass-gradient`, `v3-expert-reviewed`
- **Hosting**: GitHub Pages enabled, live at `ghaziaryan.github.io/portfolio/`
- **Untracked files not committed**: `.DS_Store`, `.agent/`, `.agents/`, `.claude/`, `.cursor/`, resume PDF, `chat.html`, `setup.html`, `vibe-check.html`, `review-*.html`, `feedback.md`, `IMG_0420.jpeg`, `briefing.html`, `direction.html`

## 10. Workflow requirements
- **All communication via interactive HTML pages** — never terminal text
- **Copy editor pass** ("grizzled old man") on all portfolio text before delivery
- **10-expert review panel** on portfolio builds only (not interview pages), threshold: 95/100
- **Use frontend-design skill** for all pages (interviews AND portfolio)
- **Interview before inventing** — ask user for specific details, don't fabricate
