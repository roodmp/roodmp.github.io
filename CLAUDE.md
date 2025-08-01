# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Mark Rood (roodmp.github.io) deployed via GitHub Pages. It's a static website showcasing:
- Resume/CV (index.html)
- About page (about.html) 
- Resources page (resources.html)
- PowerShell utilities showcase (powershell.html)
- Easter egg game - Red Panda Flappy (red-panda-flappy.html)

## Architecture & Structure

**Static Site Architecture:**
- Pure HTML/CSS/JavaScript with no build system or framework dependencies
- Uses Tailwind CSS via CDN for styling
- Feather Icons for iconography
- Material-UI dependencies in package.json (for future React components)

**Key Files:**
- `index.html` - Resume/CV page (default page per _config.yml)
- `about.html` - About page set as index_page in Jekyll config
- `main.js` - Core JavaScript for theme switching, navigation, and easter egg functionality
- `_config.yml` - Jekyll/GitHub Pages configuration
- `.github/workflows/pages.yml` - GitHub Actions deployment workflow

**Theme System:**
- Implements light/dark/system theme switching
- Uses Tailwind's dark mode with CSS custom properties
- Theme preference stored in localStorage
- System theme detection via `prefers-color-scheme` media query

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
- Modular functions for theme management and easter egg features

**CSS:**
- Tailwind utility-first approach
- Custom CSS properties for theme variables
- Responsive breakpoints and smooth transitions

**Content Management:**
- Direct HTML editing for content updates
- No CMS or content management system
- Manual deployment via git push to main branch

## Navigation Maintenance

**Current Architecture:**
- Navigation HTML is duplicated across all pages (index.html, about.html, resources.html, powershell.html)
- This maintains simplicity and fast loading for the static site
- Each page contains ~50 lines of identical navigation code

**Navigation Update Checklist:**
When updating navigation items, logos, or theme toggle:
1. Update `index.html` navigation section
2. Update `about.html` navigation section  
3. Update `resources.html` navigation section
4. Update `powershell.html` navigation section
5. Test theme toggle functionality on all pages
6. Verify responsive behavior across pages

**Future Componentization Consideration:**
Consider moving to a component-based navigation when:
- Site grows to 10+ pages
- Navigation updates become frequent
- Adding a build system for other reasons
- Team collaboration requires stricter consistency

**Navigation Sections to Keep in Sync:**
- Header navigation (`<header>` with logo and nav links)
- Theme toggle button (`#themeToggle` with Material Icons)
- Mobile responsiveness classes
- ARIA accessibility attributes