<?php
/**
 * Snippet Master RestApi class.
 *
 * @package  namespace CustomCodeSnippetsManager\RestApi
 */

namespace CustomCodeSnippetsManager;

defined( 'ABSPATH' ) || exit; // Exit if accessed directly.

use CustomCodeSnippetsManager\Routes\SnippetsRoutes;
use CustomCodeSnippetsManager\Traits\Singleton;

/**
 * RestApi class.
 *
 * @since 1.0.0
 */
class RestApi {

	use Singleton;

	/**
	 * Rest api endpoints.
	 *
	 * @since 1.0.0
	 *
	 * @var array
	 */
	protected $route_classes = array();

	/**
	 * Hook into WordPress ready to init the REST API as needed.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function __construct() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_rest_routes' ) );
	}

	/**
	 * Register REST API routes.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public static function register_rest_routes() {
		foreach ( self::get_route_classes() as $class_name ) {

			if ( class_exists( $class_name ) ) {
				$object = new $class_name();
				$object->register_routes();
			}
		}
	}

	/**
	 * List of classes routes.
	 *
	 * @since 1.0.0
	 * @static
	 *
	 * @return array
	 */
	protected static function get_route_classes() {
		return apply_filters(
			'ccsnpt_rest_api_get_rest_namespaces',
			array(
				'snippets' => SnippetsRoutes::class,
			)
		);
	}
}
