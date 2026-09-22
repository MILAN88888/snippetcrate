<?php
/**
 * SnippetCrate InitController class.
 *
 * @since 1.0.0
 *
 * @package  namespace SnippetCrate\Controllers\InitController
 */

namespace SnippetCrate\Controllers;

defined( 'ABSPATH' ) || exit; // Exit if accessed directly.

use SnippetCrate\Models\Snippets;
use SnippetCrate\Traits\Singleton;

/**
 * Initial Controller class.
 *
 * @since 1.0.0
 */
class InitController {

	use Singleton;

	/**
	 * Constructor.
	 *
	 * Only registers hooks; snippet execution is deferred to front-end
	 * request lifecycle so nothing is eval'd in wp-admin, REST or cron.
	 */
	public function __construct() {
		add_action( 'wp', array( $this, 'run_global_snippets' ) );
		add_action( 'wp_head', array( $this, 'load_snippets_at_header' ) );
		add_action( 'wp_footer', array( $this, 'load_snippets_at_footer' ) );
		add_shortcode( 'snippetcrate_snippet', array( $this, 'render_shortcode' ) );
	}

	/**
	 * Render a shortcode-scoped snippet: [snippetcrate_snippet id="1"].
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string The rendered output.
	 */
	public function render_shortcode( $atts ) {
		$atts = shortcode_atts( array( 'id' => 0 ), $atts, 'snippetcrate_snippet' );
		$id   = absint( $atts['id'] );

		if ( ! $id ) {
			return '';
		}

		$snippet_inst = new SnippetsController();
		$res          = $snippet_inst->get_active_snippets( array( 'id' => $id ) );

		if ( empty( $res['results'][0] ) ) {
			return '';
		}

		$snippet = $res['results'][0];

		// Only active, shortcode-scoped snippets render via the shortcode.
		if ( empty( $snippet->active ) || 'shortcode' !== $snippet->scope ) {
			return '';
		}

		$lang = isset( $snippet->lang ) ? strtoupper( $snippet->lang ) : 'PHP';

		if ( 'PHP' === $lang ) {
			ob_start();
			try {
				// phpcs:ignore Squiz.PHP.Eval.Discouraged, Generic.PHP.ForbiddenFunctions.Found -- Running admin-authored snippet code is this plugin's core purpose; access is manage_options-only and PHP is syntax-checked before it can be saved.
				eval( $snippet->codesnippet );
			} catch ( \Throwable $error ) {
				ob_end_clean();
				$this->handle_snippet_error( $snippet, $error );
				return '';
			}
			return ob_get_clean();
		}

		if ( 'CSS' === $lang ) {
			return '<style>' . $snippet->codesnippet . '</style>';
		}

		if ( 'JS' === $lang ) {
			return '<script>' . $snippet->codesnippet . '</script>';
		}

		return $snippet->codesnippet;
	}

	/**
	 * Run the active global code snippets.
	 *
	 * Runs once per front-end request (the `wp` action does not fire in
	 * wp-admin, REST or cron). Global snippets are side-effecting code
	 * (registering hooks, shortcodes, defining functions), so any output
	 * they emit is buffered and discarded.
	 *
	 * @return void
	 */
	public function run_global_snippets() {
		if ( is_admin() ) {
			return;
		}

		$this->run_scope( array( 'global' ), true );
	}

	/**
	 * Load the snippets at header section.
	 *
	 * @return void
	 */
	public function load_snippets_at_header() {
		$this->run_scope( array( 'header' ), false );
	}

	/**
	 * Load the snippets at footer section.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function load_snippets_at_footer() {
		$this->run_scope( array( 'footer' ), false );
	}

	/**
	 * Fetch and execute the active snippets for the given scope(s).
	 *
	 * @param array $scopes         The scope(s) to run.
	 * @param bool  $discard_output Whether to buffer and discard any output.
	 * @return void
	 */
	protected function run_scope( $scopes, $discard_output ) {
		$snippet_inst = new SnippetsController();
		$res          = $snippet_inst->get_active_snippets(
			array(
				'status' => 1,
				'scope'  => $scopes,
			)
		);

		if ( ! isset( $res['results'] ) || empty( $res['results'] ) ) {
			return;
		}

		foreach ( $res['results'] as $snippet ) {
			if ( empty( $snippet->codesnippet ) ) {
				continue;
			}

			$lang = isset( $snippet->lang ) ? strtoupper( $snippet->lang ) : 'PHP';

			if ( 'PHP' === $lang ) {
				$this->execute_snippet( $snippet, $discard_output );
			} elseif ( ! $discard_output ) {
				// JS/CSS/HTML are emitted as markup at the header/footer hooks
				// only; never while buffering the early global pass.
				$this->print_snippet_markup( $snippet, $lang );
			}
		}
	}

	/**
	 * Print a non-PHP snippet as markup (script/style/raw HTML).
	 *
	 * @param object $snippet The snippet.
	 * @param string $lang    The snippet language (JS, CSS or HTML).
	 * @return void
	 */
	protected function print_snippet_markup( $snippet, $lang ) {
		if ( 'CSS' === $lang ) {
			echo "\n<style>\n" . $snippet->codesnippet . "\n</style>\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		} elseif ( 'HTML' === $lang ) {
			echo "\n" . $snippet->codesnippet . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		} else {
			echo "\n<script>\n" . $snippet->codesnippet . "\n</script>\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		}

		do_action( 'snippetcrate_after_execute_snippet', $snippet );
	}

	/**
	 * Execute a single snippet.
	 *
	 * @param object $snippet        The snippet.
	 * @param bool   $discard_output Whether to buffer and discard any output.
	 *
	 * @return \Throwable|mixed Caught error, or result of snippet execution.
	 */
	protected function execute_snippet( $snippet, $discard_output = true ) {
		if ( $discard_output ) {
			ob_start();
		}

		try {
			// phpcs:ignore Squiz.PHP.Eval.Discouraged, Generic.PHP.ForbiddenFunctions.Found -- Running admin-authored snippet code is this plugin's core purpose; access is manage_options-only and PHP is syntax-checked before it can be saved.
			$result = eval( $snippet->codesnippet );
		} catch ( \Throwable $error ) {
			$result = $error;
			$this->handle_snippet_error( $snippet, $error );
		} finally {
			if ( $discard_output ) {
				ob_end_clean();
			}
		}

		do_action( 'snippetcrate_after_execute_snippet', $snippet );

		return $result;
	}

	/**
	 * Handle a snippet execution error.
	 *
	 * Logs the failure when debugging is enabled and deactivates the
	 * offending snippet so a broken snippet cannot fatal every request.
	 *
	 * @param object     $snippet The snippet that failed.
	 * @param \Throwable $error   The caught error.
	 * @return void
	 */
	protected function handle_snippet_error( $snippet, $error ) {
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			error_log( // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				sprintf(
					'SnippetCrate: error executing snippet #%1$s: %2$s',
					isset( $snippet->id ) ? $snippet->id : '?',
					$error->getMessage()
				)
			);
		}

		if ( isset( $snippet->id ) ) {
			( new Snippets() )->update_status(
				array(
					'id'     => $snippet->id,
					'active' => 0,
				)
			);
		}
	}
}
