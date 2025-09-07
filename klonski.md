# Klonski Sliding Block Puzzle - PRD/Dev Handoff

## Product Overview

Klonski (also known as Klotski) is a classic sliding block puzzle game where players must move blocks of different sizes within a confined 4x5 grid to get the largest block (the "hero" block) to a designated exit area. This implementation will match the visual style and design of the existing solitaire game on the portfolio site.

## Game Rules & Mechanics

### Objective
Move the 2x2 hero block (Cao Cao) to the bottom center exit position by sliding other blocks out of the way.

### Block Types
- **Hero Block (2x2)**: The main block that needs to reach the exit - prominently colored (gold/orange)
- **General Blocks (1x2 or 2x1)**: Horizontal/vertical rectangular blocks - secondary color
- **Soldier Blocks (1x1)**: Single square blocks - neutral color

### Movement Rules
- Blocks can only slide horizontally or vertically into adjacent empty spaces
- No jumping, rotating, or removing blocks
- Only one block moves at a time
- All movements must stay within the 4x5 grid boundaries

### Win Condition
The puzzle is solved when the hero block is positioned so that it occupies the two bottom-center cells of the grid (exit area).

## Technical Specifications

### Architecture
- Self-contained HTML file following existing solitaire.html structure
- Pure JavaScript implementation (no external frameworks)
- Tailwind CSS for styling via CDN
- Integration with shared navigation system

### Game Board
- 4x5 grid (20 total cells)
- Responsive grid sizing for mobile/tablet/desktop
- Visual grid lines for block positioning clarity
- Designated exit area highlighting

### Block Rendering
- CSS Grid positioning system
- Smooth CSS transitions for sliding animations
- Distinct visual styling for each block type
- Hover/focus states for interactive feedback
- Touch-friendly sizing for mobile devices

### Controls
- **Desktop**: Click and drag blocks to adjacent empty spaces
- **Mobile**: Touch and swipe gestures with haptic feedback
- **Keyboard**: Arrow keys for block movement (accessibility)
- **Double-click/tap**: Quick move to nearest valid position if available

### Game Features
- Multiple puzzle configurations/difficulty levels
- Move counter and timer
- Undo system with move history
- Reset to initial state
- Auto-save current puzzle state
- Solution hints (optional)
- Win detection with celebration modal

## Visual Design

### Theme Consistency
Match existing solitaire game styling:
- Dark theme with surface colors (#0F0F0F, #1A1A1A, #262626)
- Floating particle background animation
- Fixed header with rounded navigation
- Consistent button styling and modal system
- Responsive breakpoints matching solitaire

### Block Styling
- **Hero Block**: Gold/orange gradient with subtle glow
- **General Blocks**: Blue/purple gradient
- **Soldier Blocks**: Gray/silver with clean borders
- All blocks: Rounded corners, drop shadows, smooth transitions

### Interactive Elements
- Pulse animation for valid move destinations
- Subtle hover effects on draggable blocks
- Visual feedback for invalid moves
- Success animation on puzzle completion

## User Stories

### Core Gameplay
- As a player, I want to drag blocks to adjacent empty spaces so I can rearrange the puzzle layout
- As a player, I want visual feedback when I hover over blocks so I know which ones are moveable
- As a player, I want to see valid move destinations highlighted so I can plan my strategy
- As a player, I want to track my move count so I can challenge myself to solve with fewer moves

### Quality of Life Features
- As a player, I want to undo my last move so I can correct mistakes
- As a player, I want to reset the puzzle so I can start over
- As a player, I want my progress saved so I can continue later
- As a player, I want different puzzle configurations so I can try new challenges

### Mobile Experience
- As a mobile player, I want touch-friendly block sizes so I can easily interact with blocks
- As a mobile player, I want haptic feedback so I get tactile confirmation of moves
- As a mobile player, I want swipe gestures so I can quickly move blocks
- As a mobile player, I want the game controls positioned for thumb access

## Acceptance Criteria

### Functional Requirements
- [ ] 4x5 grid renders correctly on all devices
- [ ] All block types render with correct sizes and positioning
- [ ] Blocks slide smoothly to adjacent empty spaces when dragged
- [ ] Invalid moves are prevented and provide visual feedback
- [ ] Win condition is detected when hero block reaches exit
- [ ] Move counter tracks all block movements
- [ ] Undo system restores previous game state
- [ ] Reset functionality returns to initial puzzle configuration

### Visual Requirements
- [ ] Dark theme matches existing solitaire styling exactly
- [ ] Floating particles background animation present
- [ ] Navigation header consistent with other site pages
- [ ] Block styling distinct but harmonious with overall theme
- [ ] Responsive design works on mobile, tablet, and desktop
- [ ] Smooth animations for all block movements and interactions

### Performance Requirements
- [ ] Game loads within 2 seconds
- [ ] Block movements respond within 100ms of user input
- [ ] No frame rate drops during animations
- [ ] Memory usage remains stable during extended play

### Accessibility Requirements
- [ ] Keyboard navigation support for all game functions
- [ ] ARIA labels for screen reader compatibility
- [ ] Color contrast meets WCAG guidelines
- [ ] Touch targets meet minimum 44px requirement on mobile

## File Structure

```
games/
├── klonski.html          # Main game file (self-contained)
└── solitaire.html        # Reference implementation
```

## Implementation Notes

### Block Position System
Use CSS Grid with explicit grid positioning:
```css
.block-hero { grid-column: span 2; grid-row: span 2; }
.block-general-h { grid-column: span 2; grid-row: span 1; }
.block-general-v { grid-column: span 1; grid-row: span 2; }
.block-soldier { grid-column: span 1; grid-row: span 1; }
```

### Move Validation Logic
- Calculate current block boundaries
- Check adjacent cells for empty space
- Validate move doesn't cause overlaps or go out of bounds
- Update grid state and animate movement

### Puzzle Configurations
Start with classic Huarong Dao configuration, expand to include:
- Easy: Fewer blocks, clearer path
- Medium: Standard configuration
- Hard: Complex arrangements requiring more moves
- Expert: Minimal space, maximum strategic thinking required

## Success Metrics

- Game completion rate > 60%
- Average session time > 5 minutes
- Return player rate > 40%
- Mobile usability score > 85%
- Page load performance score > 90%

This implementation will provide an engaging, polished sliding block puzzle experience that seamlessly integrates with the existing portfolio site's design and architecture.