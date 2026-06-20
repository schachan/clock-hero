# Clock Hero

**Clock Hero** is a browser-based game that helps kids practice reading analog clocks. Players look at a watch face, type the time using an on-screen keypad, and progress through levels that gradually introduce harder minute values and more complex clock designs.

Progress is saved locally in the browser — no account or backend required.

## Features

- **18 levels** across six chapters: O'clock, Half past, Quarters, Tens, Five minutes, and Any time
- **Multiple watch faces** with Arabic or Roman numerals and increasing visual complexity
- **Age-based difficulty** (ages 5–14) with faster speed-bonus thresholds for older players
- **Scoring system** with points for correct answers, speed bonuses, and penalties for wrong answers
- **Age challenges** — complete all levels at one age to unlock the next age tier
- **Review mode** to revisit missed answers and explanations
- **Sound effects and confetti** for positive feedback

## Tech stack

| Layer | Choice |
| --- | --- |
| UI | React 19, TypeScript |
| Routing | React Router |
| Build tool | Vite 6 |
| Tests | Vitest, Testing Library, jsdom |
| Persistence | `localStorage` (client-side only) |

## Prerequisites

- [Node.js](https://nodejs.org/) **18 or later** (recommended for Vite 6)
- npm (included with Node.js)

## Local setup

### 1. Clone the repository

```bash
git clone git@github.com:schachan/clock-hero.git
cd clock-hero
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Vite prints a local URL (typically `http://localhost:5173`). Open it in your browser to play.

### 4. Production build (optional)

```bash
npm run build
npm run preview
```

`npm run build` outputs static files to `dist/`. `npm run preview` serves that build locally so you can verify production behavior.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage (80% thresholds) |

## How to play

1. Enter a name and select an age on the start screen, then click **Let's Go!**
2. Choose a level from the level map (only unlocked levels are playable).
3. Read the clock and enter the hour and minute using the keypad.
4. Earn points for correct answers; answer quickly for a speed bonus.
5. Reach the level score target (50 points) to complete a level and unlock the next one.
6. Finish all 18 levels to unlock the next age challenge.

Use **Reset saved progress** on the start or level map screen to clear name, age, and level progress from `localStorage`.

## Project structure

```
src/
├── components/       # UI screens and game widgets (Clock, Game, Keypad, etc.)
├── constants/        # Level definitions, scoring rules, watch face configs
├── routes/           # Route path helpers
├── utils/              # Clock math, storage, audio, time explanations
├── test/             # Vitest setup
├── App.tsx           # Root layout and routing
└── main.tsx          # Application entry point
```

## Configuration

No environment variables or external services are required. All game configuration lives in source:

- **Levels and chapters** — `src/constants/levels.ts`
- **Scoring and age rules** — `src/constants/scoring.ts`
- **Watch face styles** — `src/constants/watchFaces.ts`

## License

Private project — not published to npm (`"private": true` in `package.json`).
