=== SnippetCrate ===
Contributors: wpmilan
Tags: code snippets, custom code, php snippets, code manager, css
Requires at least: 5.2
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Easily manage and run custom PHP, JavaScript, CSS and HTML code snippets in WordPress — no theme or plugin file editing required.

== Description ==

SnippetCrate is a 100% free and open-source plugin that lets you add, manage, and run custom code snippets on your WordPress site without editing theme or plugin files.

Everything is managed from a clean, modern admin screen with a built-in code editor, so you can add a tracking script, a small PHP tweak, or some custom CSS in seconds — and turn it off just as fast.

**Features**

* Add **PHP, JavaScript, CSS and HTML** snippets from a clean, modern admin screen.
* A built-in **CodeMirror** editor with syntax highlighting and line numbers.
* **Live syntax checking** as you type — PHP is validated on the server and JavaScript in your browser — so snippets with errors cannot be saved.
* Choose **where each snippet runs**: PHP globally, any language in the header or footer, or on demand via the `[snippetcrate_snippet id="X"]` shortcode.
* **Duplicate** snippets, **filter** by status, language, tag or date, and **bulk** activate, deactivate, export or delete.
* **Import and export** snippets as a JSON file, or export your PHP snippets to a `.php` file.
* **Contained execution**: a PHP snippet that throws an error is caught and the snippet is automatically deactivated, so one bad snippet does not break every page load that follows.
* All snippet management is restricted to administrators (`manage_options`).

**How SnippetCrate runs your PHP, and why that is safe**

Running administrator-written PHP is what this plugin is for, so it does use
`eval()`. That is the feature, not a shortcut, and it is fenced in on every
side:

* **Only administrators can write a snippet.** Every route that saves or edits
  one requires the `manage_options` capability and a valid REST nonce. On a
  multisite network a Super Admin is required as well, because a single-site
  administrator must not gain network-wide code execution.
* **Nothing from a visitor is ever executed.** There is no front-end form, no
  AJAX endpoint and no import path that reaches the executor. Snippet code
  comes only from the database, written there by an administrator.
* **PHP is parsed before it can be saved.** The code is run through
  `token_get_all()` with the `TOKEN_PARSE` flag, which fully parses it without
  executing anything. Code that does not parse is rejected, and the error is
  shown in the editor as you type.
* **A snippet that fails is switched off.** Every execution is wrapped in a
  `try`/`catch`. If a snippet throws, it is deactivated immediately, so the
  next page load no longer runs it.
* **It only runs on the front end.** Global snippets are hooked to `wp`, which
  never fires in wp-admin, REST requests or cron, so a broken snippet cannot
  lock you out of your own dashboard.
* **JavaScript, CSS and HTML are never evaluated.** They are printed as markup
  in the header or footer.

To be straight about the limit: this contains anything PHP can throw, which is
the overwhelming majority of mistakes. It cannot rescue you from a snippet that
loops forever or exhausts the memory limit, because PHP cannot catch those. Test
substantial snippets on a staging site first.

**Scopes explained**

* **Global** (PHP only) — runs on every front-end request.
* **Header / Footer** — output is printed in `wp_head` or `wp_footer` (PHP, JS, CSS or HTML).
* **Shortcode** — rendered only where you place `[snippetcrate_snippet id="X"]`.

== Installation ==

1. Upload the `snippetcrate` folder to the `/wp-content/plugins/` directory, or install the plugin through the **Plugins → Add New** screen in WordPress.
2. Activate the plugin through the **Plugins** screen.
3. Open **SnippetCrate** from the WordPress admin menu.
4. Click **Add New Snippet**, choose a language and scope, paste your code, and Save & Activate.

== Frequently Asked Questions ==

= Who can add or run snippets? =

Only administrators (users with the `manage_options` capability). All admin screens and REST endpoints are capability-checked and nonce-protected.

= What happens if my PHP snippet has an error? =

SnippetCrate validates PHP syntax on save, so code that does not parse cannot be saved. If an active snippet still throws an error at runtime, it is caught and the snippet is automatically deactivated, so the failure does not repeat on the next request. Failures PHP cannot catch — an infinite loop, or exhausting the memory limit — cannot be recovered this way, so test substantial snippets on a staging site first.

= Which languages are supported? =

PHP, JavaScript, CSS and HTML. Only PHP can use the "Global" scope; every other language runs in the header, footer, or via shortcode.

= How do I run a snippet only in one place? =

Set its scope to **Shortcode** and insert `[snippetcrate_snippet id="X"]` (the shortcode is shown on the edit screen) wherever you want it to render.

= Does the plugin load anything from a third-party server? =

No. The admin app, code editor and fonts are all bundled with the plugin and served from your site. Nothing is loaded from an external CDN.

= Does uninstalling remove my data? =

Yes. Deleting the plugin removes its database table and options. Deactivating the plugin leaves your snippets intact.

== Source Code and Build Process ==

This plugin is fully open source (GPLv2 or later) and contains no obfuscated or
minified-only code.

**Where the source lives**

The human-readable source for everything in `dist/` ships inside the plugin:

* `src/` — the admin application (TypeScript and React), one directory per screen
* `src/style/globals.css` — the admin stylesheet
* `includes/` — all PHP, unminified

`dist/` contains nothing but the compiled output of those files.

**How to rebuild it**

The bundle is produced from the sources above with webpack and Babel. Requires
Node.js 18+:

`npm install`
`npm run build`

**Bundled third-party libraries**

All are MIT licensed and GPL compatible:

* CodeMirror 6 — https://github.com/codemirror/dev — the code editor
* acorn — https://github.com/acornjs/acorn — browser-side JavaScript syntax checking
* React and React DOM — https://github.com/facebook/react
* TanStack Query — https://github.com/TanStack/query — admin data fetching
* Radix UI primitives — https://github.com/radix-ui/primitives — accessible UI components
* lucide-react — https://github.com/lucide-icons/lucide — icons

== Screenshots ==

1. Manage all your snippets with status, language, scope and priority at a glance, plus quick totals.
2. Add or edit a snippet in the built-in CodeMirror editor with language and scope selectors.
3. Live syntax validation flags errors in the editor before you can save.
4. Filter snippets by status, language, tag or date range.

== Upgrade Notice ==

= 1.0.0 =
Initial release of SnippetCrate.

== Changelog ==

= 1.0.0 =
* Initial release.
* Add and manage PHP, JavaScript, CSS and HTML snippets with header, footer, global or shortcode scope.
* Built-in CodeMirror editor with live syntax validation (PHP on the server, JavaScript in the browser).
* Duplicate, status/language/tag/date filtering, bulk activate/deactivate/export, and JSON/PHP import & export.
* Automatic deactivation of PHP snippets that throw errors at runtime.
* Admin-only access with capability checks and nonce-protected REST endpoints.
