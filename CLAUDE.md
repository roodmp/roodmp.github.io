# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Mark Rood (roodmp.github.io) deployed via GitHub Pages. It's a static website showcasing:
- Resume/CV (index.html)
- About / Workspace page (about.html) — Linear-inspired project browser with board/list views, search, filters, and detail panel
- Resources page (resources.html)
- PowerShell utilities showcase (powershell.html)
- PSWindowsUpdate tool page (pswindowsupdate.html)
- Seat Planner app (seat-planner.html) — drag-and-drop table/seat assignment tool
- Should I Use AI? decision tool (should-i-use-ai.html) — interactive flowchart
- Brick Breaker game (games/brick-breaker.html) — canvas-based breakout clone
- Solitaire game (games/solitaire.html) — classic Klondike solitaire
- Klotski sliding puzzle (games/klotski.html) — block sliding puzzle game
- MCP Server Setup (mcp-server-setup.html) — setup instructions for the About Me MCP server
- Agent Workflow Visualizer (agent-workflow-visualizer.html) — interactive agent pipeline diagram
- Design System v2 preview (design-system-v2.html) — living style guide for the site's design tokens
- Easter egg game - Red Panda Flappy (games/red-panda-flappy.html)

## Architecture & Structure

**Static Site Architecture:**
- Pure HTML/CSS/JavaScript with no build system or framework dependencies
- Uses Tailwind CSS via CDN for styling
- Feather Icons for iconography
- Material-UI dependencies in package.json (for future React components)

**File Tree:**
```
roodmp.github.io/
├── index.html                  # Resume/CV (default page)
├── about.html                  # Workspace/project browser
├── resources.html              # Resources & links
├── powershell.html             # PowerShell utilities
├── pswindowsupdate.html        # PSWindowsUpdate tool
├── seat-planner.html           # Drag-and-drop seat planner
├── should-i-use-ai.html        # AI decision flowchart
├── mcp-server-setup.html         # MCP server setup instructions
├── agent-workflow-visualizer.html # Agent workflow diagram
├── design-system-v2.html       # Design system preview
├── games/
│   ├── brick-breaker.html      # Brick Breaker game
│   ├── solitaire.html          # Klondike solitaire game
│   ├── red-panda-flappy.html   # Easter egg Flappy Bird clone
│   └── klotski.html            # Klotski sliding puzzle
├── main.js                     # Shared JS: nav, mobile menu, easter egg
├── design-system.css           # CSS custom properties (design tokens)
├── styles.css                  # Additional shared styles
├── assets/
│   └── css/tailwind.css        # Tailwind overrides
├── klonski.md                  # Klotski game PRD/dev handoff doc
├── _config.yml                 # Jekyll/GitHub Pages config
├── AGENTS.md                   # Cross-agent quick reference
└── .github/
    └── workflows/pages.yml     # GitHub Actions deployment
```

**Key Files:**
- `index.html` - Resume/CV page (default page per _config.yml)
- `about.html` - About/Workspace page (project browser with board/list views), set as index_page in Jekyll config
- `main.js` - Core JavaScript for navigation, mobile menu, and easter egg functionality
- `design-system.css` - CSS custom properties (colors, typography, spacing) used by design-system-v2.html and newer pages
- `klonski.md` - PRD/dev handoff document for the Klotski sliding puzzle game
- `_config.yml` - Jekyll/GitHub Pages configuration
- `.github/workflows/pages.yml` - GitHub Actions deployment workflow

**Theme:**
- Dark-only design using Tailwind's `class="dark"` on the `<html>` element
- No theme toggle or light mode switching

**Mobile Menu System:**
- Slide-in mobile menu triggered by `.mobile-menu-btn` hamburger button
- Closed via `.mobile-menu-close` button, Escape key, or clicking a nav link
- Uses `.open` class toggle with CSS transitions
- Logic lives in `main.js` (DOMContentLoaded handler)

**Easter Egg System:**
- Konami code and "PANDA" key sequence detection in main.js
- Triggers confetti animation and opens Red Panda Flappy game
- Game is a complete Flappy Bird clone with red panda character

**Navigation:**
- Fixed header with responsive navigation
- Table of contents on resume page with smooth scrolling
- Current page highlighting in navigation

## Development Commands

**Local Development:**
```bash
# Start development server (recommended)
npm run dev

# Alternative commands
npm run serve          # Same as dev
npm run preview        # Uses npx serve instead of Python

# Manual commands (if npm unavailable)
python3 -m http.server 3000
npx serve . -p 3000
```

**Deployment:**
- Automatically deployed to GitHub Pages via Actions on push to main branch
- No build process required - static files served directly
- Live site: https://roodmp.github.io

**Preview Notes:**
- VS Code Live Preview may not load Tailwind CSS properly due to CDN restrictions
- Always use a proper HTTP server for accurate preview
- Local server shows exact deployed appearance

**Dependencies:**
- Material-UI packages installed for potential future React integration
- All current functionality uses CDN resources (Tailwind, Feather Icons)

## Code Conventions

**HTML Structure:**
- Semantic HTML5 with proper accessibility attributes
- Responsive design with mobile-first approach
- Uses Tailwind utility classes for styling

**JavaScript:**
- ES6+ features used throughout
- Event-driven architecture for UI interactions
- Modular functions for mobile menu and easter egg features

**CSS:**
- Tailwind utility-first approach
- Custom CSS properties for theme variables
- `design-system.css` defines the canonical design tokens (colors, typography, spacing); reference it when adding new pages that need consistent branding
- Responsive breakpoints and smooth transitions

**Content Management:**
- Direct HTML editing for content updates
- No CMS or content management system
- Manual deployment via git push to main branch

**About Page Project List:**
- The `about.html` page contains a `projects` array in its `<script>` block that drives the board/list views
- When adding a new standalone page or tool to the site, also add a corresponding entry to this `projects` array so it appears in the "Things I Built" workspace
- Each entry needs: `id` (next MR-022 number), `name`, `status`, `type`, `tags`, `description`, `link` (if navigable), and `image` (if available)

**Projects Array Schema:**
```javascript
{
  id: 'MR-022',            // String — sequential ID, next available: MR-022
  name: 'Project Name',    // String — display name
  status: 'shipped',       // 'shipped' | 'in-progress' | 'backlog'
  type: 'tool',            // 'tool' | 'game' | 'app' | 'design' | 'bot' | 'extension'
  tags: ['tag1', 'tag2'],  // String[] — freeform tags for filtering
  description: '...',      // String — short description shown in cards/list
  link: 'page.html',       // String | undefined — relative URL if the project has a page
  image: 'assets/img.png'  // String | undefined — thumbnail path
}
```

## Navigation Maintenance

**Current Architecture:**
- Navigation HTML is duplicated across pages (index.html, about.html, resources.html, powershell.html)
- This maintains simplicity and fast loading for the static site
- Each page contains ~50 lines of identical navigation code

**Navigation Update Checklist:**
When updating navigation items, logos, or mobile menu:
1. Update `index.html` navigation section
2. Update `about.html` navigation section
3. Update `resources.html` navigation section
4. Update `powershell.html` navigation section (has its own nav style)
5. Verify mobile menu opens/closes correctly on all pages
6. Verify responsive behavior across pages

**Current Nav Links (3 items):**
- About (about.html) — workspace/project browser
- Resumé (index.html)
- Resources (resources.html)

**Future Componentization Consideration:**
Consider moving to a component-based navigation when:
- Site grows to 10+ pages
- Navigation updates become frequent
- Adding a build system for other reasons
- Team collaboration requires stricter consistency

**Navigation Sections to Keep in Sync:**
- Header navigation (`<header>` with logo and nav links)
- Mobile menu markup (`.mobile-menu` panel with `.mobile-menu-btn` and `.mobile-menu-close`)
- Mobile responsiveness classes
- ARIA accessibility attributes

## How to Add a New Page

1. **Create the HTML file** at the repo root (or in a subdirectory like `games/`). Use an existing page as boilerplate — copy the `<head>` section, Tailwind CDN link, and dark-mode `<html class="dark">` attribute.
2. **Choose the header pattern:**
   - Main pages use the floating header with nav links (see `index.html`).
   - Standalone tools/games use a compact back-arrow header (see `brick-breaker.html`).
3. **Update navigation on the 4 main pages** if adding the page to the top nav bar (see Navigation Update Checklist above). Most tool/game pages do NOT go in the top nav.
4. **Add an entry to the `projects` array** in `about.html` so it appears in the workspace browser. Use the next sequential `MR-###` ID and follow the schema above.
5. **Push to `main`** — GitHub Actions auto-deploys to roodmp.github.io.