<?php
/**
 * Snippet Master InitController class.
 *
 * @since 1.0.0
 *
 * @package  namespace SnippetMaster\Controllers\InitController
 */

namespace SnippetMaster\Controllers;

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
	 */
	public function __construct() {
		// Run the active snippet.
		$this->run();
		add_action( 'wp_head', array( $this, 'load_snippets_at_header' ) );
		add_action( 'wp_footer', array( $this, 'load_snippets_at_footer' ) );
	}
	/**
	 * Run the active code snippets.
	 *
	 * @return void
	 */
	protected function run() {
		$snippet_inst = new SnippetsController();
		$res          = $snippet_inst->get_active_snippets(
			array(
				'status' => 1,
				'scope'  => array( 'global' ),
			)
		);

		if ( ! isset( $res['results'] ) || empty( $res['results'] ) ) {
			return;
		}

		$snippets = $res['results'];

		$this->execute_snippets( $snippets );
	}
	/**
	 * Execute the snippets.
	 *
	 * @param [type] $snippets The list of snippets.
	 * @return void
	 */
	protected function execute_snippets( $snippets ) {
		if ( empty( $snippets ) ) {
			return;
		}

		foreach ( $snippets as $snippet ) {
			if ( ! empty( $snippet->codesnippet ) ) {
				$this->execute_snippet( $snippet );
			}
		}
	}

	/**
	 * Execute snippets.
	 *
	 * @param [array] $snippet The snippet.
	 *
	 * @return ParseError|mixed Code error if encountered during execution, or result of snippet execution otherwise.
	 */
	protected function execute_snippet( $snippet ) {
		ob_start();

		try {
			$result = eval( $snippet->codesnippet );
		} catch ( ParseError $parse_error ) {
			$result = $parse_error;
		}

		ob_end_clean();

		do_action( 'custom_code_snippets_after_execute_snippet', $snippet );

		return $result;
	}
	/**
	 * Load the snippets at header section.
	 *
	 * @return void
	 */
	public function load_snippets_at_header() {
		$this->print_active_snippets( 'header' );
	}

	/**
	 * Load the snippets at footer section.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function load_snippets_at_footer() {
		$this->print_active_snippets( 'footer' );
	}

	/**
	 * Print the active snippets.
	 *
	 * @param string $section The area where snippets need to print.
	 *
	 * @return void
	 */
	public function print_active_snippets( $section ) {
		$snippet_inst = new SnippetsController();
		$res          = $snippet_inst->get_active_snippets(
			array(
				'status' => 1,
				'scope'  => array( 'global', $section ),
			)
		);

		if ( ! isset( $res['results'] ) || empty( $res['results'] ) ) {
			return;
		}

		$snippets = $res['results'];
		foreach ( $snippets as $snippet ) {
			echo "\n", '<?php' . $snippet->codesnippet . '?>', "\n"; // phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped

		}
	}
}
