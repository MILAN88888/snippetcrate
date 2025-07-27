<?php
/**
 *  Menus class.
 *
 * @since 1.0.0
 * @package SnippetMaster\Menus
 */

namespace SnippetMaster\Controllers\Admin;

use SnippetMaster\Helper;
use SnippetMaster\Traits\Singleton;

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
			$svg    = '<svg enable-background="new 0 0 32 32" height="32px" id="svg2" version="1.1" viewBox="0 0 32 32" width="32px" xmlns="http://www.w3.org/2000/svg">
  <g id="sourcecode">
    <polygon points="22,22 22,26 32,16 22,6 22,10 28,16" fill="#FF0000"/>
    <polygon points="10,22 10,26 0,16 10,6 10,10 4,16" fill="#0000FF"/>
    <polygon points="10,20 14,20 22,12 18,12" fill="#00FF00"/>
  </g>
</svg>';
		$base64_svg = 'data:image/svg+xml;base64,' . base64_encode($svg); // phpcs:ignore
		$page       = add_menu_page( esc_html__( 'Snippet Master', 'snippet-master' ), esc_html__( 'Snippet Master', 'snippet-master' ), 'manage_options', 'snippet-master', array( $this, 'main_page' ), $base64_svg );

		add_action( "admin_print_scripts-$page", array( $this, 'enqueue' ) );
	}

	/**
	 * Handles output of the reports page in admin.
	 */
	public function main_page() {
		wp_enqueue_style( 'snippet-master-main' );
		echo '<div id="snippet-master"></div>';
	}

	/**
	 * Enqueue.
	 *
	 * @since 1.0.0
	 */
	public function enqueue() {
		wp_enqueue_script( 'snippet-master-main' );
	}
}
