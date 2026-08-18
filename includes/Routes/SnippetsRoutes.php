<?php
/**
 * Snippet Master SnippetsRoutes class.
 *
 * @package SnippetMaster\Routes\SnippetsRoutes
 */

namespace SnippetMaster\Routes;

defined( 'ABSPATH' ) || exit; // Exit if accessed directly.

use SnippetMaster\Controllers\SnippetsController;
use SnippetMaster\Middleware\SnippetsAuthMiddleware;

/**
 * Add Snippets Routes class.
 */
class SnippetsRoutes extends BaseRoutes {

	/**
	 * Endpoint namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'snippet-master';

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'snippets';

	/**
	 * Register routes.
	 *
	 * @return void
	 */
	public function register_routes() {
		$controller = new SnippetsController();
		$permission = array( new SnippetsAuthMiddleware(), 'check_access_permissions' );

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/save',
			array(
				'methods'             => 'POST',
				'callback'            => array( $controller, 'save_snippets' ),
				'permission_callback' => $permission,
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/get',
			array(
				'methods'             => 'GET',
				'callback'            => array( $controller, 'get_snippets' ),
				'permission_callback' => $permission,
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/update/status',
			array(
				'methods'             => 'POST',
				'callback'            => array( $controller, 'update_status' ),
				'permission_callback' => $permission,
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/delete',
			array(
				'methods'             => 'POST',
				'callback'            => array( $controller, 'delete_snippets' ),
				'permission_callback' => $permission,
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/validate',
			array(
				'methods'             => 'POST',
				'callback'            => array( $controller, 'validate_syntax' ),
				'permission_callback' => $permission,
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/duplicate',
			array(
				'methods'             => 'POST',
				'callback'            => array( $controller, 'duplicate_snippet' ),
				'permission_callback' => $permission,
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/bulk/status',
			array(
				'methods'             => 'POST',
				'callback'            => array( $controller, 'bulk_update_status' ),
				'permission_callback' => $permission,
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/export',
			array(
				'methods'             => 'POST',
				'callback'            => array( $controller, 'export_snippets' ),
				'permission_callback' => $permission,
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/import',
			array(
				'methods'             => 'POST',
				'callback'            => array( $controller, 'import_snippets' ),
				'permission_callback' => $permission,
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/tags',
			array(
				'methods'             => 'GET',
				'callback'            => array( $controller, 'get_tags' ),
				'permission_callback' => $permission,
			)
		);
	}
}
