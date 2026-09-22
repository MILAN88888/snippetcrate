<?php
/**
 * Plugin Name: SnippetCrate
 * Plugin URI: https://techzigya.com/snippetcrate
 * Description: Add, manage and run custom PHP, JavaScript, CSS and HTML code snippets in WordPress — no theme or plugin file editing required.
 * Version: 1.0.0
 * Author: @wpmilan
 * Author URI: https://milanc.com.np/
 * Text Domain: snippetcrate
 * Domain Path: /languages/
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Requires at least: 5.2
 * Requires PHP: 7.4
 *
 * @package SnippetCrate
 */

use SnippetCrate\Migration\Migration;

defined( 'ABSPATH' ) || exit;

// Load the Composer autoloader when present, otherwise fall back to a
// lightweight PSR-4 autoloader so the plugin works without `composer install`.
if ( file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
	require __DIR__ . '/vendor/autoload.php';
} else {
	spl_autoload_register(
		function ( $class_name ) {
			$prefix   = 'SnippetCrate\\';
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

// Define SNIPPETCRATE_VERSION.
if ( ! defined( 'SNIPPETCRATE_VERSION' ) ) {
	define( 'SNIPPETCRATE_VERSION', '1.0.0' );
}

// Define SNIPPETCRATE_PLUGIN_FILE.
if ( ! defined( 'SNIPPETCRATE_PLUGIN_FILE' ) ) {
	define( 'SNIPPETCRATE_PLUGIN_FILE', __FILE__ );
}

// Define SNIPPETCRATE_DIR.
if ( ! defined( 'SNIPPETCRATE_DIR' ) ) {
	define( 'SNIPPETCRATE_DIR', plugin_dir_path( __FILE__ ) );
}

// Define SNIPPETCRATE_DS.
if ( ! defined( 'SNIPPETCRATE_DS' ) ) {
	define( 'SNIPPETCRATE_DS', DIRECTORY_SEPARATOR );
}

// Define SNIPPETCRATE_URL.
if ( ! defined( 'SNIPPETCRATE_URL' ) ) {
	define( 'SNIPPETCRATE_URL', plugin_dir_url( __FILE__ ) );
}

/**
 * Initialization of Plugin.
 */
add_action( 'plugins_loaded', array( 'SnippetCrate\Plugin', 'init' ) );

/**
 * Register activation hook.
 */
register_activation_hook(
	__FILE__,
	function () {
		Migration::init();
	}
);
