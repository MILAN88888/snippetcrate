<?php
/**
 *  Menus class.
 *
 * @since 1.0.0
 * @package SnippetCrate\Menus
 */

namespace SnippetCrate\Controllers\Admin;

defined( 'ABSPATH' ) || exit; // Exit if accessed directly.

use SnippetCrate\Helper;
use SnippetCrate\Traits\Singleton;

/**
 * Menus class.
 *
 * @since 1.0.0
 */
class MenusController {

	use Singleton;

	/**
	 * Constructor.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_menu' ) );
	}
	/**
	 * Add menu items.
	 */
	public function add_menu() {
		if ( ! Helper::current_user_can_manage() ) {
			return;
		}

			// Brackets framing two code lines — a "code snippet" mark. Coloured in
			// the default admin-menu grey so it reads on the dark menu background.
			$svg    = '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#a7aaad" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <rect x="9" y="20" width="30" height="21" rx="3.5"/>
    <rect x="5" y="11" width="38" height="9" rx="2.5"/>
    <path d="M22 27 L18.5 30.8 L22 34.6"/>
    <path d="M26 27 L29.5 30.8 L26 34.6"/>
  </g>
</svg>';
		$base64_svg = 'data:image/svg+xml;base64,' . base64_encode( $svg ); // phpcs:ignore
		$page       = add_menu_page( esc_html__( 'SnippetCrate', 'snippetcrate' ), esc_html__( 'Code Snippets', 'snippetcrate' ), 'manage_options', 'snippetcrate', array( $this, 'main_page' ), $base64_svg );

		add_action( "admin_print_scripts-$page", array( $this, 'enqueue' ) );
	}

	/**
	 * Handles output of the reports page in admin.
	 */
	public function main_page() {
		wp_enqueue_style( 'snippetcrate-main' );
		echo '<div id="snippetcrate-app"></div>';
	}

	/**
	 * Enqueue.
	 *
	 * @since 1.0.0
	 */
	public function enqueue() {
		wp_enqueue_script( 'snippetcrate-main' );
	}
}
