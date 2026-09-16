=== Custom Code Snippets Manager ===
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

Custom Code Snippets Manager is a 100% free and open-source plugin that lets you add, manage, and run custom code snippets on your WordPress site without editing theme or plugin files.

Everything is managed from a clean, modern admin screen with a built-in code editor, so you can add a tracking script, a small PHP tweak, or some custom CSS in seconds — and turn it off just as fast.

**Features**

* Add **PHP, JavaScript, CSS and HTML** snippets from a clean, modern admin screen.
* A built-in **CodeMirror** editor with syntax highlighting and line numbers.
* **Live syntax checking** as you type — PHP is validated on the server and JavaScript in your browser — so snippets with errors cannot be saved.
* Choose **where each snippet runs**: PHP globally, any language in the header or footer, or on demand via the `[ccsm_snippet id="X"]` shortcode.
* **Duplicate** snippets, **filter** by status, language, tag or date, and **bulk** activate, deactivate, export or delete.
* **Import and export** snippets as a JSON file, or export your PHP snippets to a `.php` file.
* **Safe execution**: a PHP snippet that throws an error is caught and automatically deactivated, so a bad snippet can never take your site down.
* All snippet management is restricted to administrators (`manage_options`).

**Scopes explained**

* **Global** (PHP only) — runs on every front-end request.
* **Header / Footer** — output is printed in `wp_head` or `wp_footer` (PHP, JS, CSS or HTML).
* **Shortcode** — rendered only where you place `[ccsm_snippet id="X"]`.

== Installation ==

1. Upload the `custom-code-snippets-manager` folder to the `/wp-content/plugins/` directory, or install the plugin through the **Plugins → Add New** screen in WordPress.
2. Activate the plugin through the **Plugins** screen.
3. Open **Custom Code Snippets Manager** from the WordPress admin menu.
4. Click **Add New Snippet**, choose a language and scope, paste your code, and Save & Activate.

== Frequently Asked Questions ==

= Who can add or run snippets? =

Only administrators (users with the `manage_options` capability). All admin screens and REST endpoints are capability-checked and nonce-protected.

= What happens if my PHP snippet has an error? =

Custom Code Snippets Manager validates PHP syntax on save, so code that does not parse cannot be saved. If an active snippet still throws an error at runtime, it is caught and the snippet is automatically deactivated so it cannot break your site.

= Which languages are supported? =

PHP, JavaScript, CSS and HTML. Only PHP can use the "Global" scope; every other language runs in the header, footer, or via shortcode.

= How do I run a snippet only in one place? =

Set its scope to **Shortcode** and insert `[ccsm_snippet id="X"]` (the shortcode is shown on the edit screen) wherever you want it to render.

= Does the plugin load anything from a third-party server? =

No. The admin app, code editor and fonts are all bundled with the plugin and served from your site. Nothing is loaded from an external CDN.

= Does uninstalling remove my data? =

Yes. Deleting the plugin removes its database table and options. Deactivating the plugin leaves your snippets intact.

== Screenshots ==

1. Manage all your snippets with status, language, scope and priority at a glance, plus quick totals.
2. Add or edit a snippet in the built-in CodeMirror editor with language and scope selectors.
3. Live syntax validation flags errors in the editor before you can save.
4. Filter snippets by status, language, tag or date range.

== Upgrade Notice ==

= 1.0.0 =
Initial release of Custom Code Snippets Manager.

== Changelog ==

= 1.0.0 =
* Initial release.
* Add and manage PHP, JavaScript, CSS and HTML snippets with header, footer, global or shortcode scope.
* Built-in CodeMirror editor with live syntax validation (PHP on the server, JavaScript in the browser).
* Duplicate, status/language/tag/date filtering, bulk activate/deactivate/export, and JSON/PHP import & export.
* Automatic deactivation of PHP snippets that throw errors at runtime.
* Admin-only access with capability checks and nonce-protected REST endpoints.
