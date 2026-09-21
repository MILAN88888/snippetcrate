# Custom Code Snippets Manager

A free WordPress plugin to add, manage, and run custom **PHP, JavaScript, CSS and HTML**
code snippets — with a CodeMirror editor and live syntax validation — without touching theme
or plugin files.

## Features

- PHP, JavaScript, CSS and HTML snippets with header / footer / global / shortcode scope
  (`[ccsm_snippet id="X"]`).
- CodeMirror code editor with **live syntax checking** while you type (PHP on the server via
  `token_get_all(TOKEN_PARSE)`, JavaScript in the browser via `acorn`); invalid snippets
  cannot be saved.
- Duplicate snippets, filter by tag, and bulk activate / deactivate / export / delete.
- Import & export snippets as JSON, or export PHP snippets to a `.php` file.
- Safe execution — a PHP snippet that errors is caught and auto-deactivated.

## Development

Package manager is **pnpm** (use the globally installed pnpm, not corepack). PHP tooling
via **composer**.

```bash
pnpm install                 # install JS dependencies
pnpm run start               # watch + rebuild (development)
pnpm run build               # production build into dist/
node_modules/.bin/tsc --noEmit          # typecheck
node_modules/.bin/eslint . --ext .ts,.tsx   # lint

composer install             # PHP autoloader + coding-standards tooling
composer run-script phpcs    # PHP CodeSniffer (WordPress standards)
```

`dist/` is committed — rebuild it whenever `src/` changes. Composer is a development
dependency only: the plugin registers its own PSR-4 fallback autoloader, so the
distributed package ships no `vendor/` directory.

## Release

```bash
npx gulp release             # regenerates the .pot and writes release/*.zip
```

The zip contains only the runtime files (`custom-code-snippets-manager.php`,
`uninstall.php`, `includes/`, `dist/`, `languages/`, `readme.txt`, `LICENSE`).
Verify it with the WordPress Plugin Check plugin before submitting:

```bash
wp plugin check custom-code-snippets-manager
```

WordPress.org assets (banners, icon, screenshots) live in `.wordpress-org/` and are
uploaded to the SVN `assets/` directory, not shipped inside the plugin.

The React source lives in `src/`, the PHP in `includes/` (PSR-4 root `CustomCodeSnippetsManager\`).
See `CLAUDE.md` for the full architecture and the execution/validation model.
