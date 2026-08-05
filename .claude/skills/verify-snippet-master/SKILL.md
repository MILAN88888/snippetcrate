---
name: verify-snippet-master
description: Runtime smoke-test the Snippet Master plugin on the local urm.local site via wp-cli — activate, confirm snippets execute per scope, confirm broken snippets are contained, then restore. Use to prove a PHP/behaviour change actually works end-to-end, not just that it compiles.
---

# Verify Snippet Master

Confirms the plugin runs correctly on the local WordPress install. Run wp-cli from the
WordPress root (`/home/devsme/Sites/urm`). The site is **host-served at
`http://urm.local/`** — the Docker `localhost:8080` stack is broken (wrong DB_HOST).
`WP_DEBUG_LOG` is on, so fatals land in `wp-content/debug.log`.

The plugin ships a PSR-4 autoloader fallback, so it runs **without** `composer install`.

## How execution works (what you're verifying)

- **PHP** snippets: `scope=global` `eval`s once per **front-end** request (hooked to
  `wp`; never in wp-admin/REST/cron, output discarded); `scope=header`/`footer` `eval`
  at `wp_head`/`wp_footer` with their echoed output appearing in the page — **no raw
  `<?php` should ever reach the HTML**.
- **JavaScript** snippets (`lang=JS`): never `eval`'d — printed as an inline
  `<script>` at `wp_head` (header) or `wp_footer` (footer). JS may only use header or
  footer scope (enforced in validation), never global.
- A PHP snippet that throws is caught (`\Throwable`), logged under `WP_DEBUG`, and
  **auto-deactivated** so it can't white-screen the site.
- Snippet code is stored with `<?php`/`?>` stripped.

## Syntax validation (must block invalid saves)

- **PHP** is checked server-side in `SnippetsController` via
  `Helper::php_syntax_error()` (`token_get_all($code, TOKEN_PARSE)` — parses without
  executing); a bad snippet returns a `codesnippet` error and is not saved.
- **JavaScript** is checked in the browser with `acorn` on submit before the request
  is sent.
- Verify quickly server-side:
  `php -r 'require "includes/Helper.php"; var_dump(SnippetMaster\Helper::php_syntax_error("$x = ;"));'`
  → should return the parse-error message (not `false`).

## Driving the admin UI in a browser (Playwright)

The React app and REST routes are gated by `manage_options`. Mint both auth cookies
with wp-cli (the logged-in cookie alone is rejected by `/wp-admin` over http):

```bash
wp eval '$u=get_user_by("login","admin");$e=time()+7200;$h=COOKIEHASH;
  echo "wordpress_".$h."=".wp_generate_auth_cookie($u->ID,$e,"auth")."\n";
  echo "wordpress_logged_in_".$h."=".wp_generate_auth_cookie($u->ID,$e,"logged_in")."\n";'
```

Add both cookies (domain `urm.local`, path `/`, httpOnly) to the Playwright context,
then open `http://urm.local/wp-admin/admin.php?page=snippet-master`. The Monaco editor
exposes `window.monaco`; set code with
`window.monaco.editor.getModels()[0].setValue(...)` (fires the form's onChange). Note
the app is hash-routed — `page.goto` to a different `#/...` on the same document does
**not** reload; call `page.reload()` to get a fresh form.

## Smoke test

```bash
cd /home/devsme/Sites/urm
wp plugin activate snippet-master
: > wp-content/debug.log

# One working global snippet + one deliberately broken one.
wp db query "INSERT INTO wp_ccsnpt_snippets
  (title,lang,description,codesnippet,tags,scope,priority,active,created_by,updated_by) VALUES
  ('good','PHP','t','error_log(\"SM_RAN\");','','global',10,1,'1','1'),
  ('bad','PHP','t','error_log(\"x\"','','global',10,1,'1','1')"

curl -s -o /dev/null -w 'HTTP %{http_code}\n' http://urm.local/   # expect 200

grep -iE 'SM_RAN|error executing snippet|fatal' wp-content/debug.log
wp db query "SELECT id,title,active FROM wp_ccsnpt_snippets"       # 'bad' should be active=0
```

Expected: `HTTP 200`, `SM_RAN` logged (global ran), `error executing snippet #… `
logged (broken one caught), and the broken row flipped to `active=0`.

For header/footer, insert a snippet with `scope='header'` (or `'footer'`) whose
`codesnippet` is `echo "<!--SM_MARK-->";`, load the homepage, and confirm the marker is
in the HTML while `grep -c '<?php'` on the response is `0`.

## Restore afterward (leave no trace)

```bash
wp db query "DELETE FROM wp_ccsnpt_snippets"
wp plugin deactivate snippet-master          # it starts inactive
: > wp-content/debug.log
```

To drive wp-admin flows (the React app, REST endpoints — all gated by
`manage_options`), mint auth cookies with wp-cli rather than logging in via the UI.
