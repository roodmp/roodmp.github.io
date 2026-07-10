# Gravity Run - PRD/Dev Handoff

## Product Overview

Gravity Run is a Run 3–inspired 3D endless runner. The player is a small blob auto-running through a hexagonal tunnel floating in space, jumping over gaps in the floor and strafing onto the tunnel walls — landing on a wall rotates gravity so that wall becomes the new floor, making the entire tunnel interior a playable surface. The run ends when the player falls through a gap into space. Distance traveled is the score.

This implementation is a single self-contained file at `games/gravity-run.html` and must match the structure and visual chrome of the existing `games/brick-breaker.html` (the site's reference on-system game). It introduces the site's first JavaScript library dependency: Three.js, version-pinned via jsDelivr. Do not add any other dependency.

## Game Rules & Mechanics

### Objective
Run as far as possible. There is no win state — the run ends when the blob falls through a gap. Beat your best distance.

### The Tunnel
- Hexagonal cross-section tunnel extending away from the camera along −Z.
- The tunnel is a grid of tiles: **6 faces × 3 lanes per face = 18 lanes around the ring**, extending forward in rows.
- Each tile is a thin box, ~2 world units long (Z) × ~2 units wide, lying flat on its face of the hexagon.
- Each grid cell is either `NORMAL` (solid tile) or `GAP` (missing — fall through). A `CRUMBLING` tile type (breaks ~0.4s after being stepped on) is a stretch goal, not required for v1.

### Gravity Rotation (the core mechanic — read carefully)
Implement rotation the easy way: **the player never leaves the bottom of the screen; the tunnel rotates instead.**
- Gravity is always screen-down. The player's physics is a simple 1-D vertical problem (jump impulse, gravity acceleration, land on tile) plus a lane index.
- The player occupies one of the 3 lanes on the current "floor" face. Strafing left/right moves one lane per input.
- When the player strafes past the outer lane of the current face (lane 0 going left, lane 2 going right), rotate the **entire tunnel group ±60° around the Z axis**, smoothly eased over ~150 ms. The adjacent face is now the floor, and the player's lane index remaps to the near edge lane of the new face (left transition → lane 2 of the new face; right transition → lane 0).
- Never rotate the camera and never change the gravity vector. All "wall running" falls out of rotating the tunnel group.
- Strafing (and face transitions) work mid-air too — this is how the player escapes a fully missing floor.

### Player & Movement
- The blob: a sphere or capsule, panda-orange (`#E8845A`), with a subtle squash on landing. It sits at a fixed X/Z near the bottom of the viewport; the world scrolls toward the camera.
- Auto-run: forward speed starts at ~12 units/s and ramps with distance to a cap of ~26 units/s (tune by feel).
- Jump: single jump only (no double jump). Fixed upward impulse + constant gravity, tuned so a jump at base speed clears 2 tile-rows of gap. Jump is allowed only when grounded.
- Landing: on descent, check the grid cell under the player's lane at the player's Z row. `NORMAL` → land. `GAP` → keep falling; once the blob passes below the tunnel floor level minus ~2 units with no tile, the run is over.
- Death: brief fall-into-space animation (blob tumbles away, tunnel keeps its last rotation, forward scroll stops), then the game-over overlay.

### Controls
- **Desktop**: `←`/`A` strafe left, `→`/`D` strafe right (one lane per press; holding repeats after ~180 ms), `↑`/`W`/`Space` jump, `P`/`Esc` pause.
- **Mobile**: swipe left/right anywhere on the canvas to strafe, tap to jump. Use `touchstart`/`touchend` with `{ passive: false }` and `preventDefault()`, same as brick-breaker; a horizontal move > ~30 px is a swipe, otherwise a tap.
- Start overlay shows both control schemes using the `.desktop-only` / `.touch-only` pattern from brick-breaker.

### Procedural Generation — Chunk Library (no solver needed)
Do not generate random per-tile noise; assemble the tunnel from a small library of **hand-authored patterns** so every run is guaranteed traversable without any path-checking code.
- A pattern is 4–8 rows of tile data, authored relative to the player's current floor face, tagged with a difficulty tier (1–4). Examples:
  - Tier 1: `safe straight` (all solid), `single gap` (one row missing under one lane)
  - Tier 2: `double gap` (2-row gap, jumpable), `staggered gaps` (forces one lane change)
  - Tier 3: `floor erosion` (current floor face mostly missing — forces a wall transition), `gap + shift`
  - Tier 4: tighter combinations of the above
- Difficulty tier rises with distance (e.g. new tier every ~400 m). The generator picks a random pattern from the current tier and **always appends ≥2 fully safe rows after a tier 3–4 pattern** so demands never stack unfairly.
- Author patterns as arrays of row strings (see Implementation Notes) so they are trivial to add and read.

### Scoring
- Distance in meters shown live in the HUD (rows crossed × tile length, rounded).
- Best distance persisted in `localStorage` under key `gravity_run_high_score`, following the exact brick-breaker pattern (integer, `parseInt(...) || 0` on load, written on game over only when beaten).
- Game-over overlay shows run distance, best distance, and a "New best!" state when applicable.

## Technical Specifications

### Architecture
- One self-contained file: `games/gravity-run.html`. Inline `<style>` and one inline `<script type="module">` IIFE-style (`'use strict'`).
- Copy the `<head>` and page chrome from `games/brick-breaker.html`: `<html lang="en" class="dark">`, favicon `../favicon.png`, Geist font, `<link rel="stylesheet" href="../design-system.css" />`, `<script src="../main.js" defer></script>`. **No Tailwind, no Inter** (see `design.md` §2.7).
- Three.js via import map (Three.js ≥ r160 is ES-modules only):

```html
<script type="importmap">
  { "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js" } }
</script>
<script type="module">
  import * as THREE from 'three';
  // game code
</script>
```

Verify the URL resolves before shipping; if the `.min` build 404s, fall back to `build/three.module.js` at the same version.

### Rendering
- `WebGLRenderer({ antialias: true })` into a `<canvas>` inside the same `.canvas-container` + HUD layout as brick-breaker; `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`.
- Resize handler sizes the canvas to the container (minus HUD), updates camera aspect + `updateProjectionMatrix()`.
- `PerspectiveCamera`, ~75° FOV, fixed position slightly above and behind the blob, looking down −Z. The camera never moves or rotates.
- Tiles: one shared `BoxGeometry` + shared materials, rendered as pooled `Mesh` instances (or `InstancedMesh`) parented to a single `tunnelGroup`. Rows that scroll behind the camera are recycled to the front with new pattern data — **no per-frame allocation** (object pooling, brick-breaker's stated performance principle).
- Depth fade: `scene.fog = new THREE.Fog(0x1A1A18, ...)` matching the background so the tunnel dissolves into darkness.
- Starfield: a single `THREE.Points` cloud outside the tunnel, slowly drifting.
- Lighting: one `DirectionalLight` + one `AmbientLight`; `MeshLambertMaterial` for tiles (cheap). The blob may use `MeshStandardMaterial` for a soft highlight.

### Game Loop & State
- Single `requestAnimationFrame` loop using the repo's shared delta-time pattern (see brick-breaker ~line 2213): `timeScale = Math.min(dt, 50) / (1000/60)`; all movement multiplied by `timeScale`.
- State machine `start → playing → paused → gameover`, driven by the same `.overlay` div system as brick-breaker (start, paused, game-over overlays).
- Auto-pause on `visibilitychange` when the tab hides.

## Visual Design

### Theme Consistency
Page chrome (header, overlays, HUD, buttons) uses `var(--...)` tokens from `design-system.css` directly. In-scene 3D materials cannot read CSS variables, so mirror the hexes into a local `COLORS` object (brick-breaker precedent, ~lines 524–539):

- Background / fog: `#1A1A18` (`--bg-primary`)
- Tile surfaces: `#2A2A27` / `#32322F` (`--bg-tertiary` / `--bg-elevated`), alternating subtly by row for motion readability
- Tile edge accent: `#4A6785` (`--accent-500`) — thin edge glow or emissive tint on tile borders
- Blob: `#E8845A` (`--panda-400`) — this is the page's single rationed panda-orange moment; do not use panda orange anywhere else
- HUD/text: `#F5F5F4` primary, `#A8A8A4` secondary; distance counter in JetBrains Mono (`--font-mono`), UI text in Geist

### Chrome
- Floating pill `.game-header` / `.game-nav` (logo → `../about.html`, links About / Resume / Resources) and mobile `.bottom-tab-bar` — copy the exact markup from `games/brick-breaker.html` lines ~388–416 including the inline SVG icons (the Feather script is not loaded on game pages).
- Overlays reuse brick-breaker's overlay styling: blurred dark panel, `--radius-lg`, token-colored buttons.

## User Stories

### Core Gameplay
- As a player, I want the blob to run forward automatically so I can focus on jumping and steering
- As a player, I want to jump over gaps with a single responsive input so near-misses feel fair
- As a player, I want to strafe onto a wall and have the tunnel rotate so the wall becomes my floor
- As a player, I want the speed to ramp up gradually so long runs stay tense
- As a player, I want to see my distance live and my best distance at the end of each run

### Quality of Life
- As a player, I want to pause and resume without losing my run
- As a player, I want an instant restart from the game-over screen
- As a player, I want my best distance remembered between visits

### Mobile Experience
- As a mobile player, I want swipe-to-strafe and tap-to-jump so I can play one-handed
- As a mobile player, I want the page to never scroll or zoom while I play
- As a mobile player, I want the bottom tab bar for site navigation like other game pages

## Acceptance Criteria

### Functional Requirements
- [ ] Blob auto-runs; speed ramps from ~12 u/s toward a ~26 u/s cap with distance
- [ ] Jump clears a 2-row gap at base speed; no double jump
- [ ] Strafing past a face edge rotates the tunnel ±60° smoothly (~150 ms) and remaps the lane correctly
- [ ] Strafe/rotation works mid-air
- [ ] Falling through a gap triggers the death sequence and game-over overlay
- [ ] Tunnel is assembled only from the pattern library; no unwinnable section can ever be generated (tier 3–4 patterns are always followed by ≥2 safe rows)
- [ ] Distance HUD updates live; best persists under `gravity_run_high_score` across reloads
- [ ] Pause via P/Esc and on tab hide; restart from game over works without reload

### Visual Requirements
- [ ] Chrome (header, tab bar, HUD, overlays) uses design-system tokens and matches brick-breaker's patterns
- [ ] Scene palette matches the mirrored token hexes; blob is the only panda-orange element
- [ ] Fog fade and starfield present; tunnel reads clearly at top speed
- [ ] Responsive canvas: correct at mobile portrait, tablet, and desktop sizes

### Performance Requirements
- [ ] 60 fps on a mid-range laptop; no GC hitches (all meshes pooled/recycled, zero per-frame allocation)
- [ ] `devicePixelRatio` capped at 2
- [ ] Page loads in under 2 seconds; Three.js is the only external script beyond fonts
- [ ] Input-to-response latency under 100 ms

### Accessibility Requirements
- [ ] Full keyboard play (arrows/WASD/Space/P/Esc)
- [ ] Overlay buttons are real `<button>` elements, focusable, with visible focus states
- [ ] ARIA labels on nav and canvas region; touch targets ≥ 44 px
- [ ] Text contrast meets WCAG AA against dark surfaces

## File Structure

```
roodmp.github.io/
├── gravity-run.md              # This document
├── about.html                  # Add MR-026 entry to projects array
├── CLAUDE.md                   # Add game to overview list + file tree
└── games/
    ├── brick-breaker.html      # Reference implementation (structure + chrome)
    └── gravity-run.html        # Main game file (self-contained) — NEW
```

### Integration Steps
1. Create `games/gravity-run.html`.
2. Prepend this entry to the `projects` array in `about.html` (~line 697, newest first):
```javascript
{
    id: 'MR-026',
    name: 'Gravity Run',
    status: 'shipped',
    type: 'game',
    tags: ['game', 'canvas', '3d'],
    description: 'A Run 3–inspired endless runner: a blob sprints through a hexagonal space tunnel, jumping gaps and strafing onto walls to rotate gravity. Built with Three.js — the site\'s first 3D game.',
    link: 'games/gravity-run.html',
    image: null
},
```
3. Update `CLAUDE.md`: add Gravity Run to the Project Overview bullet list and the file tree.
4. Do **not** add the game to the top navigation — tool/game pages stay out of the nav.

## Implementation Notes

### Tunnel Ring Math
With hexagon radius `R` (distance from tunnel axis to face center, ~6 units):
```javascript
const FACES = 6, LANES = 3, TILE = 2;
// Face f's outward-floor angle; face 0 is the bottom.
const faceAngle = f => f * (Math.PI * 2 / FACES);
// Position a tile: place it at the bottom (0, -R, z), offset across the face by lane,
// then rotate that position/orientation by faceAngle(f) around Z.
// In practice: build each tile at the bottom, add to a per-face pivot rotated by faceAngle(f),
// all inside tunnelGroup. Rotating tunnelGroup.rotation.z handles gravity transitions.
```

### Face Transition Rule
```javascript
// state: floorFace (0..5), lane (0..2)
// strafe right from lane 2: floorFace = (floorFace + 1) % 6; lane = 0; targetRot -= Math.PI/3;
// strafe left  from lane 0: floorFace = (floorFace + 5) % 6; lane = 2; targetRot += Math.PI/3;
// Each frame: tunnelGroup.rotation.z += (targetRot - tunnelGroup.rotation.z) * ease * timeScale;
```

### Pattern Data Format
One string per row, 18 chars (6 faces × 3 lanes, face 0 first), `1` = tile, `0` = gap. Patterns are authored relative to the current floor face and rotated into place when stamped:
```javascript
const PATTERNS = [
  { tier: 1, rows: [ '111111111111111111',
                     '111111111111111111',
                     '011111111111111111',   // gap in floor lane 0
                     '111111111111111111' ] },
  // ...
];
```

### Physics Tuning Constants (starting points)
```javascript
const RUN_SPEED_MIN = 12, RUN_SPEED_MAX = 26;   // units/s
const JUMP_VELOCITY = 14;                        // units/s upward
const GRAVITY = 42;                              // units/s²
const STRAFE_REPEAT_MS = 180;
// Airtime = 2*14/42 ≈ 0.67s → ~8 units at min speed ≈ 2 tile-rows + margin. Retune after feel testing.
```

### High Score (copy brick-breaker exactly)
```javascript
let highScoreVal = parseInt(localStorage.getItem('gravity_run_high_score')) || 0;
// on game over, if beaten:
localStorage.setItem('gravity_run_high_score', highScoreVal);
```

### Row Recycling
Keep ~40 rows alive. Track `nextRowZ`; each frame advance all row Zs by `speed * dt` (or move `tunnelGroup.position.z`), and when a row passes ~4 units behind the camera, restamp it at the far end with the next row of pattern data and push `nextRowZ` forward.

## Success Metrics

- Average session includes 3+ runs (instant restart encourages retries)
- Median run length > 60 seconds by a player's fifth run
- Mobile usability score > 85%
- Page load performance score > 90%

This implementation delivers a polished 3D endless runner that captures Run 3's signature wall-running gravity trick while staying a single dependency-light file that integrates seamlessly with the portfolio site's design system and existing game conventions.
