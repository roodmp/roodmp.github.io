# Mark Rood — Design System

**The single written source of truth for how this site looks, feels, and behaves.**

- **Tokens live in code:** [`design-system.css`](design-system.css) — the canonical CSS custom properties.
- **Tokens live in the browser:** [`design-system-v2.html`](design-system-v2.html) — the living style guide / visual preview.
- **This document** explains the *why* and the *rules*: when to use which token, how components compose, and how to keep new pages consistent.

If this file and `design-system.css` ever disagree, `design-system.css` wins — then fix this file.

---

## 1. Philosophy

> "Approachable technical excellence."

This site is a working portfolio: a resume, a project workspace, and a collection of small tools and games. The design should communicate the same thing the work does — **precision with warmth**.

Principles, in priority order:

1. **Care over decoration.** Every visual choice should look considered. A hairline border at the right opacity beats a drop shadow; a 4px accent dot beats an underline animation. If a detail can't justify itself, remove it.
2. **One dark world.** The site is dark-only (`<html class="dark">`, warm charcoal `#1A1A18`). No light mode, no theme toggle, no page that suddenly goes white. A visitor moving between pages should never feel like they left the site.
3. **Warm, not neon.** The palette is deliberately muted — desaturated blue, warm charcoal, soft semantic colors. The one saturated voice is **panda orange**, and it's rationed (see §3).
4. **Geometry as identity.** Everything sits on an 8px grid (`--grid-unit`). Radii, spacing, icon sizes, and the subtle 48px grid background all derive from it. Alignment is a feature.
5. **Fast and dependency-light.** Pure HTML/CSS/JS, no build step. Shared styles come from one stylesheet, fonts from one family. New dependencies need a reason.

### The red panda rule

The red panda is the signature — the single element of play in an otherwise disciplined system. It appears as:
- The favicon/logo mark and the orange notification dot on the logo
- The `--panda-*` orange scale, used as a *highlight*, never a *theme*
- The easter egg (Konami code / "PANDA" → Red Panda Flappy)

**Ration it.** One panda-orange moment per view is usually right: the active-nav dot, a section-label tick, a primary CTA. If orange appears in more than two places on screen, something is over-seasoned.

---

## 2. Tokens

All tokens are defined in `design-system.css` under `:root`. **Never hardcode a raw value that has a token.** Reference by custom property (`var(--accent-500)`), and if a page uses inline Tailwind config, map Tailwind color names to these same hex values.

### 2.1 Color — Backgrounds (Warm Charcoal scale)

| Token | Value | Use |
|---|---|---|
| `--bg-primary` | `#1A1A18` | Page background |
| `--bg-secondary` | `#22221F` | Alternate sections, `<pre>` blocks |
| `--bg-tertiary` | `#2A2A27` | Nested surfaces |
| `--bg-elevated` | `#32322F` | Raised elements: inline code, secondary buttons |
| `--bg-hover` | `#3A3A36` | Hover states on interactive surfaces |

The scale is *warm* (green-shifted grays), not neutral. Don't substitute Tailwind's `neutral`/`slate`/`zinc` grays — they read cold next to it.

### 2.2 Color — Surfaces & borders

| Token | Value | Use |
|---|---|---|
| `--surface-primary` | `#22221F` | Card backgrounds |
| `--surface-secondary` | `#2A2A27` | Nested card backgrounds |
| `--surface-border` | `rgba(255,255,255,0.08)` | Default 1px border |
| `--surface-border-subtle` | `rgba(255,255,255,0.04)` | Dividers, header underline |
| `--surface-border-accent` | `rgba(74,103,133,0.3)` | Hover/focus border tint |

Borders are white-at-low-opacity, not gray hexes — they hold up on any background in the charcoal scale.

### 2.3 Color — Accent Blue (`--accent-50` … `--accent-900`)

Primary accent is `--accent-500` `#4A6785` (deep muted blue).

- **Links:** `--accent-300` default, `--accent-200` hover
- **Primary buttons:** `--accent-500` bg, `--accent-600` hover
- **Focus rings:** `--accent-400`
- **Inline code text:** `--accent-300`

### 2.4 Color — Panda Orange (`--panda-50` … `--panda-900`)

Primary is `--panda-400` `#E8845A`. Used for: logo dot, active-nav indicator, section-label tick, `::selection`, `.btn-panda`, gradient endpoints. See the red panda rule (§1) before adding more.

### 2.5 Color — Text

| Token | Value | Use |
|---|---|---|
| `--text-primary` | `#F5F5F4` | Headings, emphasized text |
| `--text-secondary` | `#A8A8A4` | Body copy, descriptions |
| `--text-tertiary` | `#6B6B67` | Labels, metadata, placeholders |
| `--text-accent` | `#8BA7BD` | Accented inline text |
| `--text-inverse` | `#1A1A18` | Text on light/accent fills |

Body text defaults to `--text-secondary`; reserve `--text-primary` for headings and moments of emphasis. This two-level hierarchy is what keeps dense pages readable.

### 2.6 Color — Semantic

| Token | Value | Muted variant |
|---|---|---|
| `--success` | `#7CB97E` | `--success-muted` (12% alpha) |
| `--warning` | `#D4A857` | `--warning-muted` (12% alpha) |
| `--error` | `#C97373` | `--error-muted` (12% alpha) |

Soft, desaturated versions — never Tailwind's stock `green-500`/`red-500`, which glare on charcoal. Status UI = muted variant as fill + full color as text (see `.badge-*`).

### 2.7 Typography

| Token | Stack | Role |
|---|---|---|
| `--font-sans` | Geist, system-ui | Everything by default |
| `--font-serif` | Source Serif 4, Georgia | Quotes, editorial moments only |
| `--font-mono` | JetBrains Mono, SF Mono, Fira Code | Code, IDs, data |

- **Load Geist** from `https://cdn.jsdelivr.net/npm/geist@1.2.0/dist/fonts/geist-sans/style.min.css` and serif/mono from Google Fonts (copy the `<head>` from `index.html`). **Do not use Inter** — it's the tell of an off-system page.
- Scale: `--text-xs` (0.75rem) → `--text-5xl` (3rem), standard steps.
- Headings: weight 600 (h1: 700), `letter-spacing: -0.02em` (h1: `-0.03em`), `line-height: 1.25`.
- Body: `line-height: 1.6–1.7`.
- On mobile (≤768px) the top three sizes step down automatically via the media query in `design-system.css` — don't hand-roll responsive font sizes.

### 2.8 Spacing, radii, shadows, motion

- **Spacing:** `--space-1` (4px) → `--space-24` (96px), all multiples of the 8px `--grid-unit` (half-steps at 4px/12px/20px). Sections use `--space-16` vertical padding (`--space-12` on mobile).
- **Radii:** `--radius-sm` 4px (inline code) · `--radius-md` 6px (buttons, inputs) · `--radius-lg` 10px (cards) · `--radius-xl` 14px · `--radius-2xl` 20px · `--radius-full` (pills, nav, badges).
- **Shadows:** `--shadow-sm/md/lg` are soft black; `--shadow-accent` and `--shadow-panda` are colored glows reserved for button hovers.
- **Motion:** `--transition-fast` 150ms · `--transition-normal` 200ms · `--transition-slow` 300ms, all `cubic-bezier(0.4, 0, 0.2, 1)`. Entrances use `fadeInUp`/`fadeIn` with `.animate-delay-1/2/3` stagger. Nothing bounces, nothing spins; motion confirms, it doesn't perform.

### 2.9 Layout

- `.container` — 1100px max, `--space-6` gutters (`--space-4` mobile)
- `.container-narrow` — 800px (long-form reading)
- `.container-wide` — 1400px (boards, dense tools)
- `.geo-bg` — the fixed 48px geometric grid background at 3% blue; the signature ambient texture on main pages.

---

## 3. Components

All of these exist in `design-system.css` — use them before writing new CSS, and preview them on `design-system-v2.html`.

| Component | Classes | Notes |
|---|---|---|
| Buttons | `.btn` + `.btn-primary` / `.btn-secondary` / `.btn-panda` / `.btn-ghost`; sizes `.btn-lg` / `.btn-sm` | Primary = blue. Panda = the one high-emphasis CTA per page, max. |
| Cards | `.card`, `.card-elevated`, `.card-title`, `.card-desc` | 1px `--surface-border`, `--radius-lg`; hover only tints the border — cards don't lift or scale. |
| Badges | `.badge` (+ `-panda`, `-success`, `-warning`, `-error`) | Pill with a 5px `currentColor` dot; muted fill + colored text. |
| Section header | `.section`, `.section-label`, `.section-title`, `.section-desc` | `.section-label` is the signature: uppercase xs label with a 12×2px panda tick. |
| Forms | `.input`, `.label` | Focus = accent border + 3px soft blue ring. |
| Quote | `.quote` | Serif italic with blue→orange gradient bar. |
| Accents | `.accent-line`, `.gradient-line` | Blue→orange gradient bar; fading hairline divider. |
| Nav (desktop) | `.floating-header` > `.floating-nav`, `.nav-link` | Floating pill, blurred 95% charcoal, active page marked by a 4px panda dot. |
| Nav (mobile ≤640px) | `.bottom-tab-bar`, `.tab-item` | Floating bottom pill; top nav hides. `body` gets bottom padding automatically. |
| Footer | `.site-footer`, `.footer-mark` | Centered, logo mark with panda dot. |
| A11y | `.skip-link`, `.sr-only`, global `:focus-visible` | Every page gets a skip link; never remove focus outlines. |

**Signature details worth protecting** (these, more than the palette, are the brand):
- The **panda dot** as active/notification marker (logo, nav, tab bar)
- The **section-label tick** (12×2px orange dash before uppercase labels)
- The **blue→orange gradient** on accent lines and quote bars
- Panda-orange **text selection**
- The 48px **geo grid** background

---

## 4. Page patterns

Two page archetypes, per CLAUDE.md:

**Main pages** (`index`, `about`, `resources`, `powershell`): floating pill nav + mobile bottom tab bar, `.geo-bg`, standard footer. Nav markup is intentionally duplicated per page — follow the Navigation Update Checklist in CLAUDE.md when it changes.

**Standalone tools/games** (everything else): compact back-arrow header (see `games/brick-breaker.html`), no top nav, no entry in the nav bar. They still load `design-system.css`, still use Geist, still live in the charcoal world. A game may extend the palette for gameplay elements (card faces, bricks, blocks) but its chrome — header, buttons, modals, overlays — uses the system.

**Every new page must:**
1. Copy the `<head>` from an existing conforming page (fonts + `design-system.css` + `<html class="dark">`)
2. Pick the right header archetype
3. Get an entry in the `projects` array in `about.html` (next `MR-###` ID)
4. Introduce zero new hardcoded colors that duplicate a token

---

## 5. Voice & content

- Plain, confident, first person. No buzzword walls.
- Avoid AI-centric framing in bios/hero copy; lead with the general skill, not the tool.
- Microcopy is lowercase-calm ("Things I Built", not "MY PROJECT PORTFOLIO!").
- IDs, statuses, and metadata render in `--font-mono` — data should look like data.

---

## 6. Accessibility baseline

- Skip link on every page; visible `:focus-visible` outlines (2px `--accent-400`) everywhere.
- Text contrast: `--text-secondary` on `--bg-primary` is the floor (~7.3:1); don't put `--text-tertiary` on elevated backgrounds for essential copy.
- All interactive elements reachable by keyboard; Escape closes overlays (mobile menu already does).
- Respect the semantic HTML conventions already in place — landmarks, ARIA on nav/menus, `alt` on images.

---

## 7. Conformance audit (2026-07-02)

Where each page stands today:

| Page | Status | Notes |
|---|---|---|
| `index.html` | ✅ On system | Reference implementation |
| `about.html` | ✅ On system | Also loads Tailwind CDN for layout utilities — acceptable hybrid |
| `resources.html` | ✅ On system | |
| `format-translator.html` | ✅ On system | |
| `agent-workflow-visualizer.html` | ✅ On system | |
| `mcp-server-setup.html` | ✅ On system | |
| `pswindowsupdate.html` | ✅ On system | |
| `seat-planner.html` | ✅ On system | |
| `should-i-use-ai.html` | ✅ On system | |
| `games/brick-breaker.html` | ✅ On system | |
| `design-system-v2.html` | ⚠️ Drifted | Duplicates every token inline instead of linking `design-system.css`; already missing `--radius-2xl`. Should link the shared stylesheet so the style guide can't lie. |
| `powershell.html` | ❌ Off system | Tailwind CDN + Inter + own palette (`#1E40AF` blues, light-mode grays). It's a *main nav page* — highest-priority migration. |
| `games/klotski.html` | ❌ Off system | Tailwind CDN + Inter + light `slate` palette (`#f8fafc` backgrounds) |
| `games/solitaire.html` | ❌ Off system | Tailwind CDN + Inter + saturated stock colors (`#2563EB`, `#06B6D4`, `#8B5CF6`) |
| `styles.css` | 🗑️ Dead | Legacy light-theme stylesheet (Open Sans, `#555555`) referenced by **no** page — delete when convenient |

### Migration order

1. **`powershell.html`** — it's in the top nav; a visitor hits the off-brand page one click from home. Swap Inter → Geist, map its blues to `--accent-*`, charcoal-ify backgrounds.
2. **`design-system-v2.html`** — replace the inline `:root` copy with `<link rel="stylesheet" href="design-system.css">`; keep only page-specific styles inline.
3. **`games/klotski.html` and `games/solitaire.html`** — restyle the chrome (header, buttons, modals) onto the system; gameplay colors may stay expressive per §4.
4. **Delete `styles.css`** (verify no references first — none as of this audit).

---

## 8. Governance

- **Change a token?** Edit `design-system.css`, check `design-system-v2.html` still previews correctly, update this doc's tables if a value or rule changed.
- **New component?** If it'll appear on 2+ pages, it goes in `design-system.css` with a class, gets a swatch/example on `design-system-v2.html`, and a row in §3. One-page styles stay in that page's `<style>`.
- **New page?** Follow §4's checklist.
- **Tempted to hardcode a hex?** If it matches a token, use the token. If it doesn't, ask whether it should become one — or whether it should exist at all.
