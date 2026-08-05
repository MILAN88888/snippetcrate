# Snippet Master

A free WordPress plugin to add, manage, and run custom **PHP** and **JavaScript** code
snippets — with a Monaco editor and live syntax validation — without touching theme or
plugin files.

## Features

- PHP and JavaScript snippets with header / footer / global scope.
- Monaco code editor with **live syntax checking** while you type (PHP on the server via
  `token_get_all(TOKEN_PARSE)`, JavaScript in the browser via `acorn`); invalid snippets
  cannot be saved.
- Activate / deactivate, search, filter, and bulk delete.
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

`dist/` is committed — rebuild it whenever `src/` changes. The plugin also ships a
built-in PSR-4 autoloader fallback, so it runs even without `composer install`.

The React source lives in `src/`, the PHP in `includes/` (PSR-4 root `SnippetMaster\`).
See `CLAUDE.md` for the full architecture and the execution/validation model.
