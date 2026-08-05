<?php
/**
 * Snippet Master InitController class.
 *
 * @since 1.0.0
 *
 * @package  namespace SnippetMaster\Controllers\InitController
 */

namespace SnippetMaster\Controllers;

use SnippetMaster\Models\Snippets;
use SnippetMaster\Traits\Singleton;

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
			if ( ! empty( $snippet->codesnippet ) ) {
				$this->execute_snippet( $snippet, $discard_output );
			}
		}
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
			$result = eval( $snippet->codesnippet );
		} catch ( \Throwable $error ) {
			$result = $error;
			$this->handle_snippet_error( $snippet, $error );
		} finally {
			if ( $discard_output ) {
				ob_end_clean();
			}
		}

		do_action( 'custom_code_snippets_after_execute_snippet', $snippet );

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
					'Snippet Master: error executing snippet #%1$s: %2$s',
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
