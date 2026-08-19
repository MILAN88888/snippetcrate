<?php
/**
 * Custom code plugin main class.
 *
 * @since 1.0.0
 *
 * @package SnippetMaster
 */

namespace SnippetMaster;

defined( 'ABSPATH' ) || exit; // Exit if accessed directly.

use SnippetMaster\Controllers\Admin\ScriptStyleController;
use SnippetMaster\Controllers\Admin\MenusController;
use SnippetMaster\Controllers\InitController;
use SnippetMaster\Migration\Migration;
use SnippetMaster\RestApi;
use SnippetMaster\Traits\Singleton;

/**
 * Snippet Master setup.
 *
 * @since 1.0.0
 */
final class SnippetMaster {

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
		if ( plugin_basename( SNIPPET_MASTER_PLUGIN_FILE ) === $plugin_file ) {
			$new_plugin_meta = array(
				'docs' => '<a href="' . esc_url( 'https://www.milanc.com.np/projects/snippet-master' ) . '" aria-label="' . esc_attr__( 'View Docs', 'custom-code-snippets-manager' ) . '">' . esc_html__( 'Docs', 'custom-code-snippets-manager' ) . '</a>',
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
