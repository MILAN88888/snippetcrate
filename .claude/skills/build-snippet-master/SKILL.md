---
name: build-snippet-master
description: Install deps, typecheck, lint, and build the Snippet Master admin app (React/TS + PHP). Use whenever you change files under snippet-master/src or its PHP, and need a clean production bundle in dist/ or to confirm the code compiles.
---

# Build Snippet Master

The admin UI is a Webpack + Babel + TypeScript React app in `src/`, compiled into the
tracked `dist/` bundle. The PHP lives in `includes/`. Run everything from the plugin
root (`wp-content/plugins/snippet-master`).

## UI stack

The app uses **shadcn/ui (Radix primitives) + Tailwind CSS**, not Chakra (Chakra,
Emotion, framer-motion, chakra-react-select, react-select, react-icons,
react-date-range and react-responsive-pagination were all removed). Key pieces:

- Tailwind is configured in `tailwind.config.js` with `important: '#ccsm-app'`
  (scopes every utility to the mount node so nothing leaks into wp-admin) and
  `corePlugins.preflight = false` (a scoped reset lives in `src/style/globals.css`).
- `postcss.config.js` runs `tailwindcss` + `autoprefixer`; `webpack.config.js` adds
  `postcss-loader` to the `.css`/`.scss` rules and a `@ → src` `resolve.alias`
  (mirrored by `paths` in `tsconfig.json`).
- Design tokens are oklch CSS variables in `src/style/globals.css`; the font is
  Plus Jakarta Sans via `@fontsource/plus-jakarta-sans` (self-hosted, no CDN).
- Vendored shadcn components live in `src/components/ui/*`; `cn()` is in
  `src/lib/utils.ts`. Radix overlays (select/popover/dropdown/tooltip) portal into
  the `#ccsm-app` container via `src/components/PortalContext.tsx` — required
  so the scoped Tailwind utilities still match portalled content.
- Icons are `lucide-react`; toasts are `sonner`; the date range uses
  `react-day-picker` (v9 API) through `src/components/ui/calendar.tsx`.

## Install dependencies

Use the **globally installed `pnpm` (v10)**, NOT `corepack pnpm` — corepack resolves
pnpm v11 which crashes on this machine's Node 20 with
`ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`.

```bash
pnpm install
```

The repo tracks an **npm** `package-lock.json` (not pnpm). If you add/remove a
dependency in `package.json`, regenerate that lockfile and delete any stray pnpm one
before committing:

```bash
rm -f pnpm-lock.yaml
npm install --package-lock-only --no-audit --no-fund
```

### Dependency gotchas (pnpm strict layout)

`monaco-editor` and `@babel/runtime` must be declared in `package.json` even though
they arrive transitively — pnpm's strict `node_modules` won't resolve them otherwise
and the build fails with `Module not found`. `webpackbar` is intentionally absent: v6
is incompatible with the installed Webpack 5 (rejects its ProgressPlugin options).

## Quality checks (must pass before committing)

```bash
node_modules/.bin/tsc --noEmit          # typecheck
node_modules/.bin/eslint . --ext .ts,.tsx   # lint (exhaustive-deps is an error)
```

## Production build

```bash
node_modules/.bin/webpack --mode production --config ./webpack.config.js
```

Bundle-size warnings are expected and fine. This overwrites the tracked
`dist/main.js`, `dist/main.css`, and `dist/main.asset.php` — commit them separately
with a `build:` prefix. Set `ANALYZE=true` to also emit the bundle-analyzer report.

## PHP checks

```bash
for f in $(find includes custom-code-snippets-manager.php -name '*.php'); do php -l "$f"; done
```

Full WordPress Coding Standards (`composer run-script phpcs`) require WPCS installed
via `composer install`; the globally available `phpcs` lacks the `PHPCompatibilityWP`
ruleset, so fall back to the `php -l` sweep when WPCS isn't present.

## Commit convention

Single-line, lowercase `type: message` (`fix:`, `add:`, `refactor:`, `build:`). No
`Co-Authored-By` trailer.
