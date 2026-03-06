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

## Pages
| File | Description |
|------|-------------|
| `index.html` | Resume/CV (default page) |
| `about.html` | Workspace/project browser (board + list views) |
| `resources.html` | Resources & links |
| `powershell.html` | PowerShell utilities |
| `pswindowsupdate.html` | PSWindowsUpdate tool |
| `seat-planner.html` | Drag-and-drop seat assignment |
| `should-i-use-ai.html` | AI decision flowchart |
| `brick-breaker.html` | Brick Breaker game |
| `solitaire.html` | Klondike solitaire game |
| `games/klotski.html` | Klotski sliding puzzle |
| `agent-workflow-visualizer.html` | Agent workflow diagram |
| `design-system-v2.html` | Design system preview |
| `red-panda-flappy.html` | Easter egg Flappy Bird clone |

## Code Style Guidelines
- **HTML**: Semantic HTML5 with proper accessibility attributes (ARIA labels, roles)
- **CSS**: Tailwind utility-first approach with dark mode optimized colors
- **JavaScript**: ES6+ features, event-driven architecture, modular functions
- **Naming**: Use semantic class names, kebab-case for CSS, camelCase for JS
- **Error Handling**: Try-catch blocks for external dependencies (feather icons)
- **Accessibility**: Include ARIA attributes, screen reader support, keyboard navigation
- **Colors**: Use surface-* and text-* classes for consistent dark theme styling
- **Design Tokens**: `design-system.css` defines canonical CSS custom properties

## Navigation Maintenance
Navigation HTML is duplicated across all pages (index.html, about.html, resources.html, powershell.html).
When updating navigation, update ALL pages to maintain consistency.

## Adding a New Page
1. Create HTML file with dark-mode boilerplate (copy `<head>` from existing page)
2. Choose header: floating nav (main pages) or compact back-arrow (tools/games)
3. Update nav on 4 main pages if adding to top nav bar
4. Add entry to `projects` array in `about.html` (next ID: MR-021)

## Projects Array Enum Values
- **status**: `shipped` | `in-progress` | `backlog`
- **type**: `tool` | `game` | `app` | `design` | `bot` | `extension`

## Deployment
Automatically deployed to GitHub Pages via Actions on push to main branch.
Live site: https://roodmp.github.io

## Further Reading
- `CLAUDE.md` — full project documentation (architecture, conventions, file tree)
- `klonski.md` — PRD/dev handoff for the Klotski puzzle game