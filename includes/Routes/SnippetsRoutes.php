<?php
/**
 * Snippet Master SnippetsRoutes class.
 *
 * @package SnippetMaster\Routes\SnippetsRoutes
 */

namespace SnippetMaster\Routes;

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
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/save',
			array(
				'methods'             => 'POST',
				'callback'            => array( new SnippetsController(), 'save_snippets' ),
				'permission_callback' => array( new SnippetsAuthMiddleware(), 'check_access_permissions' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/get',
			array(
				'methods'             => 'GET',
				'callback'            => array( new SnippetsController(), 'get_snippets' ),
				'permission_callback' => array( new SnippetsAuthMiddleware(), 'check_access_permissions' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/update/status',
			array(
				'methods'             => 'POST',
				'callback'            => array( new SnippetsController(), 'update_status' ),
				'permission_callback' => array( new SnippetsAuthMiddleware(), 'check_access_permissions' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/delete',
			array(
				'methods'             => 'POST',
				'callback'            => array( new SnippetsController(), 'delete_snippets' ),
				'permission_callback' => array( new SnippetsAuthMiddleware(), 'check_access_permissions' ),
			)
		);
	}
}
