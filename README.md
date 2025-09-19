# Brain Sparks

Brain Sparks is a bilingual (English/Dutch) brain training web app inspired by Dr. Kawashima. It runs fully static on top of React, Vite and TypeScript, and is optimised for mobile play, fast loading and offline use via a Progressive Web App (PWA) setup. All progress is stored locally and can be exported/imported as JSON for portability.

## Features

- **Daily session**: each day combines three random mini-tests (Arithmetic Sprint, Memory Digits, Reaction Time, Odd One Out) with a playful brain age estimate.
- **Mini-tests**: responsive, keyboard friendly components with subtle haptics/sounds that respect the user’s settings.
- **Progress dashboard**: interactive charts (Chart.js) for daily totals and per-test performance plus streaks & badges.
- **Bilingual UX**: English/Dutch localisation via i18next with auto-detection, persistent toggle and translated dates/toasts.
- **PWA ready**: offline caching, install prompt support, custom icons and manifest handled via `vite-plugin-pwa`.
- **Accessibility**: focus-visible styles, high-contrast dark mode, adjustable font scale and vibration toggles.
- **Data portability**: export/import all app data (`data/example-data.json` provides sample chart data).

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173 and enjoy instant reloads. The default language follows the browser locale; use the toggle in the header to switch languages.

### Build & preview

```bash
npm run build
npm run preview
```

### Deploy to Vercel

The app is optimised for static hosting and works out of the box on Vercel:

1. Import the repository in Vercel (or connect an existing project).
2. Use `npm install` as the install command and `npm run build` as the build command.
3. Keep the output directory as `dist` (Vite’s default). Vercel will serve the generated assets with zero configuration.

Vercel automatically provides preview deployments for pull requests and handles CDN caching. No additional CI configuration is required in this repository.

## Data schema

Application data is stored under `brainSparks:v1` in `localStorage`:

```ts
type Session = {
  id: string;
  dateISO: string;
  tests: { kind: 'arithmetic' | 'memory' | 'reaction' | 'oddOneOut'; score: number; meta?: any }[];
  totalScore: number;
  brainAge: number;
};

type State = {
  sessions: Session[];
  streak: { current: number; best: number; lastDayISO: string | null };
  settings: {
    lang: 'en' | 'nl';
    dark: boolean;
    sound: boolean;
    vibration: boolean;
    difficulty: 'easy' | 'normal' | 'hard';
    fontScale: 'small' | 'medium' | 'large';
    theme: 'system' | 'light' | 'dark';
  };
  badges: string[];
  version: 1;
};
```

Use the **Export data** button in settings to download a JSON snapshot, and **Import data** to restore. Invalid files are validated with zod and will display a translated error toast.

## Development notes

- Tailwind CSS powers the design system (rounded cards, accent colours, focus outlines).
- Translations live in `src/i18n/{en,nl}/` separated by namespaces (`common`, `tests`, `results`, `settings`).
- Mini-tests reside in `src/tests/` and share common UI primitives from `src/components/`.
- State management lives in `src/state/` with a context provider backed by localStorage.
- The `pwa/` directory contains the manifest and custom service worker used by `vite-plugin-pwa` (vector icons live in `public/icons`).

## License

[MIT](LICENSE)
