<?php
/**
 * Custom code plugin main class.
 *
 * @since 1.0.0
 *
 * @package SnippetCrate
 */

namespace SnippetCrate;

defined( 'ABSPATH' ) || exit; // Exit if accessed directly.

use SnippetCrate\Controllers\Admin\ScriptStyleController;
use SnippetCrate\Controllers\Admin\MenusController;
use SnippetCrate\Controllers\InitController;
use SnippetCrate\Migration\Migration;
use SnippetCrate\RestApi;
use SnippetCrate\Traits\Singleton;

/**
 * SnippetCrate setup.
 *
 * @since 1.0.0
 */
final class Plugin {

	use Singleton;

	/**
	 * Constructor.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		add_filter( 'plugin_row_meta', array( $this, 'plugin_row_meta' ), 20, 2 );
		$this->includes();
	}

	/**
	 * Display row meta in the Plugins list table.
	 *
	 * @since 1.0.0
	 *
	 * @param  array  $plugin_meta Plugin Row Meta.
	 * @param  string $plugin_file Plugin Base file.
	 * @return array
	 */
	public function plugin_row_meta( $plugin_meta, $plugin_file ) {
		if ( plugin_basename( SNIPPETCRATE_PLUGIN_FILE ) === $plugin_file ) {
			$new_plugin_meta = array(
				'docs' => '<a href="' . esc_url( 'https://www.milanc.com.np/projects/snippet-master' ) . '" aria-label="' . esc_attr__( 'View Docs', 'snippetcrate' ) . '">' . esc_html__( 'Docs', 'snippetcrate' ) . '</a>',
			);

			return array_merge( $plugin_meta, $new_plugin_meta );
		}

		return (array) $plugin_meta;
	}

	/**
	 * Func to load the files.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	private function includes() {
		Migration::maybe_upgrade();
		MenusController::init();
		ScriptStyleController::init();
		InitController::init();
		RestApi::init();
	}
}
