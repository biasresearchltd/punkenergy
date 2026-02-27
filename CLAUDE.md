# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

This project uses **Yarn** and **Create React App** (react-scripts 5.0.1).

- `yarn start` — Start development server
- `yarn build` — Production build
- `yarn test` — Run tests (Jest + React Testing Library)

## Architecture

Single-page creative portfolio/showcase site for NFT art posters (linked to Zora). No client-side routing.

### Core Stack

- **React 18** with functional components and hooks
- **Chakra UI 2** for theming and layout (via ChakraProvider + extendTheme)
- **Custom InfiniteGrid** — 2D infinite scroll grid (vertical + horizontal) with snap-to-poster
- **Canvas API** for animated noise/grain overlay effect (NoiseOverlay)
- **Styled Components** and **Emotion** both present for CSS-in-JS

### Key Files

- `src/App.js` — Root component: Chakra theme, InfiniteGrid, single dynamic PosterButton, Zorb SVG
- `src/components/InfiniteGrid.js` — Custom 2D infinite scroll engine. Refs-based offset tracking, 3x3 tile recycling, wheel/touch/mouse-drag input, momentum + snap animation. Poster at `(row, col)` = `posters[(row + col) % N]`
- `src/postersData.js` — Poster metadata array + static image imports + `posterImages` map
- `src/components/NoiseOverlay.js` — Canvas-based animated grain effect (10-frame cache, 24fps loop, dual-layer)
- `src/components/TopRight.js` — Fixed header with Logo and PunkIcon
- `src/styles.css` — Global styles, @font-face declarations, infinite grid CSS
- `src/pstr/` — Poster image assets (pstr001–pstr011.png)

### Adding a New Poster

1. Add the poster image to `src/pstr/`
2. Add a static import and entry in the `posterImages` map in `src/postersData.js`
3. Add an entry to the `posters` array in `src/postersData.js`
4. The InfiniteGrid picks it up automatically

### Navigation Model

- **Vertical**: scroll wheel / trackpad swipe / touch drag / mouse drag
- **Horizontal**: trackpad horizontal swipe / Shift+scroll wheel / touch drag / mouse drag
- Both axes loop infinitely via modulo. Poster at grid position `(row, col)` = `posters[(row + col) % posters.length]`
- Snap-to-poster after momentum decays

### Z-Index Layering

1. InfiniteGrid viewport: 1
2. NoiseOverlay grey canvas: 8 (pointer-events: none)
3. PosterButton: 10
4. TopRight: 100
5. NoiseOverlay dark canvas: 9999 (pointer-events: none)

### Styling Conventions

- Chakra theme defines custom colors: green (#00FF46), blue (#0075FF), orange (#FF7F00), yellow (#FFFF00), chartreuse (#B5FF00), pink (#FF00C4), darkback (#192817)
- Primary font: CMU Typewriter Text (monospace). Font files in `/fonts/`
- Poster hover effect: backgroundColor and hoverColor swap on interaction

## Prettier Config

Single quotes, no semicolons, trailing commas ES5, arrow parens avoided.
