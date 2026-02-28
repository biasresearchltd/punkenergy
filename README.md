# PUNK ENERGY

The site to display the stuff of dreams.

Don't forget to unsubscribe. Everything will be OK.

## What Is This

A single-page creative portfolio and showcase for the **PUNK: Mindware** poster series — 11 original art posters displayed in an infinite 2D scrolling grid with animated grain overlay, liquid glass UI, and snap-to-poster navigation. Art by BIAS.

Live on Vercel. Posters minted on [Zora](https://zora.co).

## Tech Stack

- **React 18** (Create React App)
- **Custom InfiniteGrid** engine — imperative 2D scroll with momentum, snap, and tile recycling
- **CSS grain overlay** — dual-layer animated noise via pre-baked PNG textures (zero JS per frame)
- **Styled Components** for icon styling
- **Yarn** package manager
- Deployed on **Vercel**

## Getting Started

```bash
yarn install
yarn start
```

Production build:

```bash
yarn build
```

## Project Structure

```
punkenergy/
├── fonts/                    # @font-face web fonts (CMU Typewriter, PP Neue Bit)
├── public/                   # Static HTML entry, favicon, PWA manifest
├── scripts/
│   └── generate-noise.js     # Node script to regenerate noise texture PNGs
├── src/
│   ├── assets/               # Generated noise textures (noise-light.png, noise-dark.png)
│   ├── components/
│   │   ├── InfiniteGrid.js   # 2D infinite scroll engine
│   │   ├── NoiseOverlay.js   # Canvas-based grain (legacy, swappable)
│   │   ├── CSSGrainOverlay.js# CSS-based grain (active, zero JS)
│   │   ├── TopRight.js       # Fixed header with logo + icon links
│   │   ├── Logo.js           # Animated GIF logo linking to ppuunnkk.com
│   │   ├── Icon.js           # PunkIcon linking to punkstep.com
│   │   └── Cuberton.gif      # Animated logo asset
│   ├── icons/                # PunkIcon PNG asset
│   ├── pstr/                 # Poster images (pstr001–pstr011.png)
│   ├── App.js                # Root component, grain mode selector, poster UI
│   ├── postersData.js        # Poster metadata, blurbs, and image imports
│   ├── styles.css            # Global styles, grain keyframes, mobile breakpoints
│   └── index.js              # React DOM entry
├── .prettierrc               # Prettier config
└── package.json
```

## Key Features

### Infinite 2D Grid

The grid scrolls infinitely in all directions — vertical, horizontal, and diagonal. Posters wrap via modulo indexing: poster at grid position `(row, col)` = `posters[(row + col) % posters.length]`. The engine uses a fixed pool of 35 DOM tiles (7x5) that are imperatively repositioned as the user scrolls, with no React re-renders per pixel.

**Input methods:** scroll wheel, trackpad swipe, touch drag, mouse drag, Shift+scroll for horizontal.

After momentum decays, the grid snaps to the nearest poster.

### Grain Overlay

Two grain implementations exist side-by-side, selectable via `GRAIN_MODE` in `App.js`:

- **`'css'`** (active) — Pre-baked 400x400 noise PNGs animated with CSS `transform: translate()` + `steps()` keyframes. Dual-layer: light grain via `mix-blend-mode: screen`, dark grain via `mix-blend-mode: overlay`. Zero JavaScript per frame.
- **`'canvas'`** — Original canvas-based approach with 20 pre-generated `ImageData` frames cycled via `setTimeout`. Higher memory usage but fully procedural.

To regenerate the noise textures: `node scripts/generate-noise.js`

### Liquid Glass UI

The poster pill button and blurb panel use a translucent glass effect:
- `color-mix(in srgb, var(--bg) 40%, transparent)` for poster-colored tinted backgrounds
- `backdrop-filter: blur(6px)` for frosted glass
- `::before` pseudo-element with gradient sheen
- Inset box-shadows for depth

### Poster Pill

The bottom-left pill displays the current poster number with a tall narrow text effect via `scaleY(2.4) scale(.666)` CSS transform. Clicking toggles the blurb panel.

## Adding a New Poster

1. Add the poster image to `src/pstr/` (3:4 aspect ratio PNG, named `pstrXXX.png`)
2. In `src/postersData.js`:
   - Add a static import: `import pstrXXX from './pstr/pstrXXX.png'`
   - Add an entry to the `posters` array with `id`, `backgroundColor`, `hoverColor`, and `blurb`
   - Add the image to the `posterImages` map: `XXX: pstrXXX`
3. The InfiniteGrid picks it up automatically

Use `\n` for line breaks in blurb text.

## Z-Index Layering

| Layer | Z-Index | Element |
|-------|---------|---------|
| Grid viewport | 1 | `.infinite-grid-viewport` |
| Grain overlay (light) | 8 | `.css-grain-overlay` |
| Grain overlay (dark) | 9999 | `.css-grain-overlay::after` |
| Poster pill button | 10000 | `.poster-button` |
| Blurb panel | 10001 | `.blurb-panel` |
| Top-right header | 100 | `.top-right` |

## Fonts

- **CMU Typewriter Text** — primary monospace font for UI elements
- **PP Neue Bit** (Regular + Bold) — display font
- **Times New Roman** — blurb panel body text

## Deployment

Hosted on Vercel. Vercel CI treats ESLint warnings as errors (`process.env.CI = true`), so all lint warnings must be resolved before pushing.

## Links

- [ppuunnkk.com](https://www.ppuunnkk.com)
- [punkstep.com](https://www.punkstep.com)
