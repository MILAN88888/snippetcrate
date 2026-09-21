# CLAUDE.md

Guidance for Claude Code when working in the **Custom Code Snippets Manager** plugin (folder `custom-code-snippets-manager`; PHP namespace `CustomCodeSnippetsManager\`, constants `CCSM_*`, REST namespace `ccsm`, shortcode `[ccsm_snippet]`. The DB table prefix `ccsnpt_` and the localized object `ccsnpt_script_data` are kept for continuity).

## What this is

A standalone WordPress plugin (own git repo, author `@wpmilan`) that lets a
`manage_options` admin store custom **PHP, JavaScript, CSS and HTML** snippets in a DB
table and run them on the front end, managed through a React admin SPA and a small
custom REST API. It is **not** part of the User Registration suite it happens to sit
beside in this WordPress install.

## Architecture

### PHP (`includes/`, PSR-4 root `CustomCodeSnippetsManager\`)

- `custom-code-snippets-manager.php` — bootstrap. Loads Composer's autoloader if present, otherwise
  registers a **built-in PSR-4 fallback** (`CustomCodeSnippetsManager\` → `includes/`) so the plugin
  runs without `composer install`. Boots on `plugins_loaded`; creates the table on
  activation.
- `includes/Plugin.php` — wires the controllers (`Migration::maybe_upgrade`,
  `MenusController`, `ScriptStyleController`, `InitController`, `RestApi`).
- `includes/Controllers/InitController.php` — **execution engine** (see below).
- `includes/Controllers/SnippetsController.php` — REST callbacks + validation.
- `includes/Models/Snippets.php` — `wpdb` data layer over `{prefix}ccsnpt_snippets`.
- `includes/Routes/SnippetsRoutes.php` — registers `ccsm/snippets/{save,get,
  update/status,delete,validate}`, all gated by `SnippetsAuthMiddleware` (`manage_options`).
- `includes/Helper.php` — `php_syntax_error()` / `check_php_syntax()` (parse-only, no exec).
- `includes/Migration/Migration.php` — `dbDelta` schema + `ccsnpt_db_version` upgrade check.

### Execution model (`InitController`)

- **Languages**: `PHP`, `JS`, `CSS`, `HTML`. **Scopes**: `global`, `header`, `footer`,
  `shortcode`. Only PHP may use `global`; every other language must use header, footer
  or shortcode.
- **PHP** `scope=global` `eval`s once per **front-end** request (hooked to `wp`; never
  wp-admin/REST/cron, output discarded); `scope=header`/`footer` `eval` at
  `wp_head`/`wp_footer` with echoed output appearing in the page.
- **JS / CSS / HTML** are never `eval`'d — emitted as markup at `wp_head`/`wp_footer`
  via `print_snippet_markup()`: JS → `<script>`, CSS → `<style>`, HTML → raw echo.
- **Shortcode** scope: rendered on demand via `[ccsm_snippet id="X"]`
  (`InitController::render_shortcode`) — PHP output is captured and returned; CSS/JS/HTML
  are returned as markup. Shortcode snippets never auto-run.
- A PHP snippet that throws is caught (`\Throwable`), logged under `WP_DEBUG`, and
  **auto-deactivated** so a broken snippet can't white-screen the site.
- REST routes (all `manage_options`): `save, get, update/status, delete, validate,
  duplicate, bulk/status, export, import, tags`.

### Syntax validation

- **PHP**: server-side via `Helper::check_php_syntax()` using
  `token_get_all($code, TOKEN_PARSE)` — parses without executing. Used both on save
  (`SnippetsController::validate_snippet_data`) and by the live-check endpoint
  (`validate_syntax`).
- **JavaScript**: in the browser via `acorn`, both live and on submit.
- Invalid syntax blocks the save and is surfaced live in the editor (see below).

### Frontend (`src/`, React 18 + TypeScript, built by Webpack into `dist/`)

- **shadcn/ui (Radix primitives) + Tailwind CSS** (not Chakra), `@tanstack/react-query`,
  `react-router-dom` (HashRouter), **CodeMirror 6** editor (`src/screen/addnew/components/CodeEditor.tsx`), `react-hook-form`, `acorn`. Tailwind
  is scoped to the `#ccsm-app` mount via `important` + a disabled preflight (scoped
  reset in `src/style/globals.css`); tokens are oklch CSS vars; font is Plus Jakarta Sans.
  Vendored primitives live in `src/components/ui/*` (`cn()` in `src/lib/utils.ts`); Radix
  overlays portal into the mount node via `src/components/PortalContext.tsx`. Icons =
  `lucide-react`, toasts = `sonner`, date range = `react-day-picker`. See the
  **`build-snippet-master`** skill for the Tailwind/PostCSS/webpack wiring.
- `src/screen/snippets/` — list + table (language/scope/status badges, bulk delete),
  a Total/Active/Inactive stat-cards row (`SnippetStats.tsx`, counts via `getSnippets`
  `total_count`), and a hand-rolled pager. The list filter (`Snippets::get_snippets()`)
  supports `searchByItem, startDate/endDate, status, tag, lang, scope`; the date range is
  optional (no default range) and the filter UI uses shadcn `Select` + a `react-day-picker`
  range calendar in a popover.
- `src/screen/addnew/` — add/edit form with the CodeMirror editor, language + scope
  selectors, and **live syntax validation** (`AddNewForm.tsx`): a debounced effect runs
  acorn (JS) or calls the `validate` endpoint (PHP), then shows a CodeMirror lint diagnostic and an inline message. The editor keeps a leading
  `<?php` line only while the language is PHP — `AddNewForm` auto-strips it when switching
  to JS/CSS/HTML and re-adds it when switching back (`stripPhpOpen`/`ensurePhpOpen`); the
  server re-adds `<?php` only on a single-snippet (edit) fetch, not on the list query.
- `src/api/` — thin `@wordpress/api-fetch` wrappers; nonce from `window.ccsnpt_script_data`.

## Working here

- **Build / typecheck / lint**: use the **`build-snippet-master`** skill. TL;DR: global
  `pnpm` (not corepack), `node_modules/.bin/tsc --noEmit`, `eslint . --ext .ts,.tsx`,
  `webpack --mode production`. `dist/` is tracked — rebuild and commit it (with a
  `build:` prefix) whenever `src/` changes.
- **Runtime verification**: use the **`verify-snippet-master`** skill (wp-cli smoke test
  on `urm.me`, plus the browser-auth flow for the admin UI).
- After changing `package.json` deps, regenerate the tracked npm `package-lock.json`
  (`npm install --package-lock-only`) and delete any `pnpm-lock.yaml`.
- **Packaging**: `npx gulp release` regenerates the `.pot` and writes
  `release/custom-code-snippets-manager.zip`. Composer is dev-only — the package ships
  no `vendor/`, no `composer.json` and no `package.json`; the bootstrap's PSR-4 fallback
  autoloader covers it. `composer.json` pins `config.platform.php` to 7.4 so the dev
  toolchain installs on the declared minimum. Gate every release on
  `wp plugin check custom-code-snippets-manager` run against the *extracted zip*, not the
  working tree (the working tree always trips the hidden-file and compressed-file checks).

## Conventions

- Commits: single-line, lowercase `type: message` (`fix:`, `add:`, `refactor:`,
  `build:`). **No** `Co-Authored-By` trailer. Push to `main`.
- i18n text domain is **`custom-code-snippets-manager`** for every user-facing string.
- Table `{prefix}ccsnpt_snippets` columns: `title, lang, description, codesnippet, tags,
  scope, priority, active, created_by, updated_by, created_at, updated_at`.
