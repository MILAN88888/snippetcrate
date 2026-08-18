<?php
/**
 * Abstract routes class.
 *
 * @since 1.0.0
 *
 * @package SnippetMaster\Routes\BaseRoutes
 */

namespace SnippetMaster\Routes;

defined( 'ABSPATH' ) || exit; // Exit if accessed directly.

/**
 * Routes abstract class.
 *
 * @since 1.0.0
 */
abstract class BaseRoutes {
	/**
	 * Endpoint namespace.
	 *
	 * @since 1.0.0
	 *
	 * @var string
	 */
	protected $namespace;

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base;

	/**
	 * Register routes.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	abstract public function register_routes();
}
