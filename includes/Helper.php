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
			$result = @eval( $code );

		} catch ( Throwable $e ) {
			$result = $e->getMessage();

			ob_end_clean();

		}
		do_action( 'ccsnpt_after_execute_snippet', $code, $id, $result );

		return $result;
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
