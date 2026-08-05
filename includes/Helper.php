<?php
/**
 * Snippet Master Helper class.
 *
 * @package  namespace SnippetMaster\Helper
 *
 * @since 1.0.0
 */

namespace SnippetMaster;

/**
 * Helper methods.
 *
 * @since 1.0.0
 */
class Helper {
	/**
	 * Function to get the plugin url.
	 *
	 * @since 1.0.0
	 *
	 * @param  string $path Path.
	 */
	public static function plugin_url( $path = '/' ) {
		return untrailingslashit( plugins_url( $path, SNIPPET_MASTER_PLUGIN_FILE ) );
	}
	/**
	 * Execute the code snippets.
	 *
	 * @param [string]  $code The code.
	 * @param [integer] $id The snippet id.
	 * @return string|boolean
	 */
	public static function execute_snippet( $code, $id = 0 ) {
		if ( empty( $code ) ) {
			return false;
		}

		ob_start();

		try {
			$result = eval( $code );
		} catch ( \Throwable $e ) {
			$result = $e->getMessage();
		} finally {
			ob_end_clean();
		}

		do_action( 'ccsnpt_after_execute_snippet', $code, $id, $result );

		return $result;
	}

	/**
	 * Check PHP code for syntax errors without executing it.
	 *
	 * Uses token_get_all() with the TOKEN_PARSE flag, which performs a full
	 * parse and throws a ParseError on invalid syntax but never runs the code.
	 *
	 * @since 1.0.0
	 *
	 * @param string $code The PHP code (without opening/closing tags).
	 * @return string|false Error message when the code is invalid, false otherwise.
	 */
	public static function php_syntax_error( $code ) {
		if ( ! is_string( $code ) || '' === trim( $code ) ) {
			return false;
		}

		try {
			token_get_all( '<?php ' . $code, TOKEN_PARSE );
		} catch ( \Throwable $e ) {
			return $e->getMessage();
		}

		return false;
	}

	/**
	 * Return development.
	 *
	 * @since 1.0.0
	 *
	 * @return boolean
	 */
	public static function is_development() {
		return defined( 'SNIPPET_MASTER_DEVELOPMENT' ) && SNIPPET_MASTER_DEVELOPMENT;
	}

	/**
	 * Return Production.
	 *
	 * @since 1.0.0
	 *
	 * @return boolean
	 */
	public static function is_production() {
		return ! defined( 'SNIPPET_MASTER_DEVELOPMENT' ) || ! SNIPPET_MASTER_DEVELOPMENT;
	}
}
