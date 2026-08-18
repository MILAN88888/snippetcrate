<?php
/**
 * Plugin Name: Custom Code Snippets Manager
 * Plugin URI: https://wordpress.org/plugins/custom-code-snippets-manager
 * Description: Add, manage and run custom PHP, JavaScript, CSS and HTML code snippets in WordPress — no theme or plugin file editing required.
 * Version: 1.0.0
 * Author: @wpmilan
 * Author URI: https://milanc.com.np/
 * Text Domain: custom-code-snippets-manager
 * Domain Path: /languages/
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Requires at least: 5.2
 * Requires PHP: 7.4
 *
 * @package SnippetMaster
 */

use SnippetMaster\Migration\Migration;

defined( 'ABSPATH' ) || exit;

// Load the Composer autoloader when present, otherwise fall back to a
// lightweight PSR-4 autoloader so the plugin works without `composer install`.
if ( file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
	require __DIR__ . '/vendor/autoload.php';
} else {
	spl_autoload_register(
		function ( $class ) {
			$prefix   = 'SnippetMaster\\';
			$base_dir = __DIR__ . '/includes/';
			$len      = strlen( $prefix );

			if ( 0 !== strncmp( $prefix, $class, $len ) ) {
				return;
			}

			$relative = substr( $class, $len );
			$file     = $base_dir . str_replace( '\\', '/', $relative ) . '.php';

			if ( file_exists( $file ) ) {
				require $file;
			}
		}
	);
}

// Define SNIPPET_MASTER_VERSION.
if ( ! defined( 'SNIPPET_MASTER_VERSION' ) ) {
	define( 'SNIPPET_MASTER_VERSION', '1.0.0' );
}

// Define SNIPPET_MASTER_PLUGIN_FILE.
if ( ! defined( 'SNIPPET_MASTER_PLUGIN_FILE' ) ) {
	define( 'SNIPPET_MASTER_PLUGIN_FILE', __FILE__ );
}

// Define SNIPPET_MASTER_DIR.
if ( ! defined( 'SNIPPET_MASTER_DIR' ) ) {
	define( 'SNIPPET_MASTER_DIR', plugin_dir_path( __FILE__ ) );
}

// Define SNIPPET_MASTER_DS.
if ( ! defined( 'SNIPPET_MASTER_DS' ) ) {
	define( 'SNIPPET_MASTER_DS', DIRECTORY_SEPARATOR );
}

// Define SNIPPET_MASTER_URL.
if ( ! defined( 'SNIPPET_MASTER_URL' ) ) {
	define( 'SNIPPET_MASTER_URL', plugin_dir_url( __FILE__ ) );
}

/**
 * Initialization of SnippetMaster.
 */
add_action( 'plugins_loaded', array( 'SnippetMaster\SnippetMaster', 'init' ) );

/**
 * Register activation hook.
 */
register_activation_hook(
	__FILE__,
	function () {
		Migration::init();
	}
);
