<?php
/**
 * Plugin Name: Custom Code Snippets Manager
 * Plugin URI: https://github.com/MILAN88888/custom-code-snippets-manager
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
 * @package CustomCodeSnippetsManager
 */

use CustomCodeSnippetsManager\Migration\Migration;

defined( 'ABSPATH' ) || exit;

// Load the Composer autoloader when present, otherwise fall back to a
// lightweight PSR-4 autoloader so the plugin works without `composer install`.
if ( file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
	require __DIR__ . '/vendor/autoload.php';
} else {
	spl_autoload_register(
		function ( $class_name ) {
			$prefix   = 'CustomCodeSnippetsManager\\';
			$base_dir = __DIR__ . '/includes/';
			$len      = strlen( $prefix );

			if ( 0 !== strncmp( $prefix, $class_name, $len ) ) {
				return;
			}

			$relative = substr( $class_name, $len );
			$file     = $base_dir . str_replace( '\\', '/', $relative ) . '.php';

			if ( file_exists( $file ) ) {
				require $file;
			}
		}
	);
}

// Define CCSM_VERSION.
if ( ! defined( 'CCSM_VERSION' ) ) {
	define( 'CCSM_VERSION', '1.0.0' );
}

// Define CCSM_PLUGIN_FILE.
if ( ! defined( 'CCSM_PLUGIN_FILE' ) ) {
	define( 'CCSM_PLUGIN_FILE', __FILE__ );
}

// Define CCSM_DIR.
if ( ! defined( 'CCSM_DIR' ) ) {
	define( 'CCSM_DIR', plugin_dir_path( __FILE__ ) );
}

// Define CCSM_DS.
if ( ! defined( 'CCSM_DS' ) ) {
	define( 'CCSM_DS', DIRECTORY_SEPARATOR );
}

// Define CCSM_URL.
if ( ! defined( 'CCSM_URL' ) ) {
	define( 'CCSM_URL', plugin_dir_url( __FILE__ ) );
}

/**
 * Initialization of Plugin.
 */
add_action( 'plugins_loaded', array( 'CustomCodeSnippetsManager\Plugin', 'init' ) );

/**
 * Register activation hook.
 */
register_activation_hook(
	__FILE__,
	function () {
		Migration::init();
	}
);
