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

- `scope=global` snippets `eval` once per **front-end** request (hooked to `wp`; never
  in wp-admin/REST/cron). Their output is buffered and discarded.
- `scope=header` / `scope=footer` snippets `eval` at `wp_head` / `wp_footer` and their
  echoed output appears in the page — **no raw `<?php` should ever reach the HTML**.
- A snippet that throws is caught (`\Throwable`), logged under `WP_DEBUG`, and
  **auto-deactivated** so it can't white-screen the site.
- Snippet code is stored with `<?php`/`?>` stripped; only PHP is executed.

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
