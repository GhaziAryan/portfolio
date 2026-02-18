# HANDOVER — 18 Feb 2026

## 1. What the next session should do FIRST
- Check remaining mobile issues: nav may still show text behind it on some devices (tried solid bg + !important, may need increased z-index or padding-top on body/sections). Test on actual iPhone.
- Custom domain setup — user wants a clean domain like `ghazi.co`. CNAME + DNS records for GitHub Pages. Update OG image URL after.
- User said "I love the site otherwise" — the content and design are approved. Focus on polish only.

## 2. One thing the next session should NOT touch
Do NOT rewrite the case study copy — it was built from a deep-dive interview with real answers from Ghazi (content-deepdive.json). Capital One metrics (15% per assessment, SECON selected from hundreds, 150+ reached, 10+ onboarded) and Tape engine iterations (v1 stats → v2 labels → v3 raw notes) are accurate per his direct answers. The testimonials are real quotes from named colleagues (Sawyer Strong, Sean Webb, Megan Wiser, Drew Magyar, Rachel Rique).

Do NOT change the color palette (terracotta #c87856 + sage teal #5b9e90). User explicitly approved it.

Do NOT change the About section through-line — it was rewritten based on Ghazi's own words about detail obsession connecting to hoverboard specs, jailbreaking, and freelancing.

## 3. What we worked on / accomplished
Built Ghazi's PM portfolio across 5 major versions + extensive iteration. Currently at **v5.4** with expert panel score of **95.4/100** (passed the 95 threshold).

**This session (v5.2 through v5.4+):**

- **v5.2**: Severance easter egg (replaced Stranger Things), copy editor pass (clean)
- **v5.3**: Full-bleed pullquote section, phone frame parallax, company badge tooltips
- **v5.4**: Real content from deep-dive interview:
  - Capital One: accurate metrics (15% per assessment from stage gate reduction, SECON booth selected from hundreds, 150+ reached, 50+ interested, 10+ onboarded, Question Bank delivered month early)
  - Tape: three engine iterations with real architectural detail (stats-based → stats+labels → raw notes)
  - WBD: ServiceNow + HR portal integration, change management, shipped on deadline
  - Grati: live captions from on-device LLM, delayed shutter, vibe coding turning point
  - About section: new through-line (detail obsession → hoverboard specs → jailbreaking → freelancing)
- **Copy editor fixes**: Removed "streamlined", cut cliches, differentiated hero card from thesis, killed redundant enders
- **Contact section**: Softened "treat people like adults" → "move fast without cutting corners", added warm italic closing line
- **OG image**: Rebuilt with site's design language (dark bg, Syne 800, terracotta label, gradient divider, company badges)
- **Timeline animation**: Line draws on scroll, dots scale in + fill, text slides in with staggered delays
- **Mobile fixes** (3 rounds):
  - Nav: solid bg with !important, no backdrop-filter
  - Easter egg: z-index 10000, 100dvh, clamp() font sizes, padding + text-align center
  - Screenshots: single Journal view on mobile (hide 2nd and 3rd)
  - Tooltips: repositioned below badges on mobile, z-index 60 on hover
- **Expert panel**: 91.1 (R1) → 93.6 (R2) → 95.4 (R3, passed)

**Full version history:**
1. **v1**: Glass morphism, AI-looking
2. **v2**: Editorial + personality rewrite
3. **v3**: Expert-reviewed, scored 90/100
4. **v4**: Real feedback, real screenshots, visual overhaul
5. **v5**: Complete rebuild — Editorial Warmth + Dark Kinetic hybrid, 95.4/100

## 4. What worked / didn't (bugs + fixes)

**Worked:**
- Deep-dive interview with informed questions (read resume + reviews first) produced much better content than generic questions
- Three-engine Tape narrative was the single biggest credibility upgrade per the expert panel
- JS-driven marquee (requestAnimationFrame) solved the CSS hover jolt permanently
- Full-bleed pullquote section breaks page monotony effectively
- Timeline draw-on-scroll animation adds delight without gimmick
- Solid conviction card background (#1c1b22 dark / #eae7e1 light) fixed readability
- Copy editor pass caught "streamlined" and several weak sentence enders

**Known issues:**
- Mobile nav may still show text behind it on some iPhone models — tried solid bg + !important but user reported it persists. May need body padding-top equal to nav height, or sections need overflow: hidden.
- OG image URL hardcoded to `ghaziaryan.github.io/portfolio/` — needs updating for custom domain
- Tooltips on mobile require touch (no hover) — they work via CSS :hover which activates on tap on iOS, but UX isn't ideal

## 5. Key decisions and why
- **Single HTML file, no build tools**: `index.html` with inline CSS/JS. Deploys anywhere.
- **Four-font system**: Fraunces, Syne, Manrope, IBM Plex Mono — each has a clear role.
- **Terracotta + sage teal**: Avoids AI-basic purple and Anthropic-like cream+orange.
- **Dark mode default**: User requested. Light mode via toggle.
- **Real content via interview**: Never fabricate — interview first, write after.
- **Severance easter egg**: 5 fast clicks on nav name. Lumon-themed white overlay.
- **Copy editor pass**: Separate "grizzled old man" critique after writing. Catches AI patterns.
- **10-expert panel**: 95/100 threshold. Only for portfolio builds, not interview pages.
- **Single screenshot on mobile**: Journal view only. All three on desktop.
- **Tooltips below on mobile**: Repositioned to prevent viewport overflow.

## 6. Lessons learned / gotchas
- CSS `animation-duration` change on hover causes a jolt (animation position remaps). Use JS-driven animation with lerped speed instead.
- `backdrop-filter` on mobile Safari can be unreliable for creating opaque nav backgrounds. Use explicit solid background colors.
- `100dvh` is needed for full-viewport overlays on mobile Safari (dynamic viewport).
- `inset: 0` doesn't always work on older mobile browsers — explicit `top/left/width/height` is safer.
- Pillow can load .woff2 files downloaded from Google Fonts (use browser User-Agent to get actual font files, not HTML).
- Em dashes, "streamline", "worst case we have a good conversation" are AI tells.
- Display fonts (Syne 800) need `clamp()` sizing for mobile.
- Phone screenshots in cards look cramped on mobile — pull them out as a full-bleed break on desktop, show single on mobile.

## 7. Clear next steps
1. **Fix mobile nav bleed** — may need `padding-top` on body equal to nav height, or investigate if the issue is with `position: relative; z-index: 2` on sections
2. **Custom domain** — `ghazi.co` or similar. CNAME + DNS records for GitHub Pages
3. **Update OG image URL** when custom domain is set
4. **Consider**: one more interactive moment in thesis section (Tobias still wants it at 94)

## 8. Map of important files
| File | Role |
|------|------|
| `index.html` | The portfolio (copy of v5.html) — single-file, all CSS/JS inline |
| `v5.html` | v5 source (identical to index.html) |
| `og-image.png` | OG preview image (1200x630, matches site design language) |
| `Tape Screenshots/*.PNG` | 6 real Tape app screenshots (IMG_0414-0419) |
| `HANDOVER.md` | This file |
| `feedback.md` | User's feedback after v5.1 |
| `interview-metrics.html` | Content deep-dive interview page (9 questions) |
| `review-v5-r3.html` | Expert panel Round 3 results (avg: 95.4, passed) |
| `review-v5-r2.html` | Expert panel Round 2 results (avg: 93.6) |
| `review-v5.html` | Expert panel Round 1 results (avg: 91.1) |
| `briefing.html` | v5 Phase 1: briefing + 8-question interview |
| `direction.html` | v5 Phase 2: 3 visual direction previews |
| `v1.html` | Preserved v1 |
| `/Users/ghaziaryan/Downloads/content-deepdive.json` | Deep-dive interview answers (metrics, WBD, Grati, corrections) |
| `/Users/ghaziaryan/Downloads/interview-v5.json` | v5 personality interview answers |
| `/Users/ghaziaryan/Downloads/direction-v5.json` | v5 direction choice (A + notes) |
| `/Users/ghaziaryan/Downloads/# Performance Reviews...` | Real performance reviews from 5 colleagues |

## 9. Git state
- **Repo**: `github.com/GhaziAryan/portfolio` (public)
- **Branch**: `main`
- **Latest commit**: `d5940a5` — Show Journal screenshot on mobile
- **Tags**: `v1-glass-gradient`, `v3-expert-reviewed`
- **Hosting**: GitHub Pages enabled, live at `ghaziaryan.github.io/portfolio/`

## 10. Workflow requirements
- **All communication via interactive HTML pages** — never terminal text
- **Copy editor pass** ("grizzled old man") on all portfolio text before delivery
- **10-expert review panel** on portfolio builds only (not interview pages), threshold: 95/100
- **Use frontend-design skill** for all pages (interviews AND portfolio)
- **Interview before inventing** — ask user for specific details, don't fabricate
