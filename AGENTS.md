# AGENTS.md

## Build/Development Commands
- `npm run dev` - Start local development server (Python HTTP server on port 3000)
- `npm run serve` - Same as dev command
- `npm run preview` - Alternative using npx serve on port 3000
- No build process required - static HTML/CSS/JS files served directly
- No test framework configured - manual testing via browser

## Architecture
- Static portfolio website deployed via GitHub Pages
- Pure HTML/CSS/JavaScript with no build system or framework dependencies
- Uses Tailwind CSS via CDN, Feather Icons, Material Icons
- Dark mode only design with optimized contrast and accessibility

## Code Style Guidelines
- **HTML**: Semantic HTML5 with proper accessibility attributes (ARIA labels, roles)
- **CSS**: Tailwind utility-first approach with dark mode optimized colors
- **JavaScript**: ES6+ features, event-driven architecture, modular functions
- **Naming**: Use semantic class names, kebab-case for CSS, camelCase for JS
- **Error Handling**: Try-catch blocks for external dependencies (feather icons)
- **Accessibility**: Include ARIA attributes, screen reader support, keyboard navigation
- **Colors**: Use surface-* and text-* classes for consistent dark theme styling

## Navigation Maintenance
Navigation HTML is duplicated across all pages (index.html, about.html, resources.html, powershell.html).
When updating navigation, update ALL pages to maintain consistency.

## Deployment
Automatically deployed to GitHub Pages via Actions on push to main branch.
Live site: https://roodmp.github.io