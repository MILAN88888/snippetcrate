<?php
/**
 *  Menus class.
 *
 * @since 1.0.0
 * @package CustomCodeSnippetsManager\Menus
 */

namespace CustomCodeSnippetsManager\Controllers\Admin;

defined( 'ABSPATH' ) || exit; // Exit if accessed directly.

use CustomCodeSnippetsManager\Helper;
use CustomCodeSnippetsManager\Traits\Singleton;

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
			// Brackets framing two code lines — a "code snippet" mark. Coloured in
			// the default admin-menu grey so it reads on the dark menu background.
			$svg    = '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#a7aaad" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17 15 L9 24 L17 33"/>
    <path d="M31 15 L39 24 L31 33"/>
    <path d="M21 20 H28" opacity="0.9"/>
    <path d="M21 28 H26" opacity="0.9"/>
  </g>
</svg>';
		$base64_svg = 'data:image/svg+xml;base64,' . base64_encode( $svg ); // phpcs:ignore
		$page       = add_menu_page( esc_html__( 'Custom Code Snippets Manager', 'custom-code-snippets-manager' ), esc_html__( 'Code Snippets', 'custom-code-snippets-manager' ), 'manage_options', 'custom-code-snippets-manager', array( $this, 'main_page' ), $base64_svg );

		add_action( "admin_print_scripts-$page", array( $this, 'enqueue' ) );
	}

	/**
	 * Handles output of the reports page in admin.
	 */
	public function main_page() {
		wp_enqueue_style( 'ccsm-main' );
		echo '<div id="ccsm-app"></div>';
	}

	/**
	 * Enqueue.
	 *
	 * @since 1.0.0
	 */
	public function enqueue() {
		wp_enqueue_script( 'ccsm-main' );
	}
}
