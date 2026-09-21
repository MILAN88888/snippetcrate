<?php
/**
 * Custom Code Snippets Manager Helper class.
 *
 * @package  namespace CustomCodeSnippetsManager\Helper
 *
 * @since 1.0.0
 */

namespace CustomCodeSnippetsManager;

defined( 'ABSPATH' ) || exit; // Exit if accessed directly.

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
		return untrailingslashit( plugins_url( $path, CCSM_PLUGIN_FILE ) );
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
		$result = self::check_php_syntax( $code );

		return $result ? $result['message'] : false;
	}

	/**
	 * Check PHP code syntax and return the error message and line.
	 *
	 * @since 1.0.0
	 *
	 * @param string $code The PHP code (without opening/closing tags).
	 * @return array|false Array with `message` and `line` when invalid, false otherwise.
	 */
	public static function check_php_syntax( $code ) {
		if ( ! is_string( $code ) || '' === trim( $code ) ) {
			return false;
		}

		try {
			// The '<?php ' prefix has no newline, so reported line numbers
			// stay aligned with the user's code.
			token_get_all( '<?php ' . $code, TOKEN_PARSE );
		} catch ( \Throwable $e ) {
			return array(
				'message' => $e->getMessage(),
				'line'    => method_exists( $e, 'getLine' ) ? max( 1, (int) $e->getLine() ) : 1,
			);
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
		return defined( 'CCSM_DEVELOPMENT' ) && CCSM_DEVELOPMENT;
	}

	/**
	 * Return Production.
	 *
	 * @since 1.0.0
	 *
	 * @return boolean
	 */
	public static function is_production() {
		return ! defined( 'CCSM_DEVELOPMENT' ) || ! CCSM_DEVELOPMENT;
	}
}
