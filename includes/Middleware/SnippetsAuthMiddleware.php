<?php
/**
 * Snippet Auth Middleware Class.
 *
 * @since 1.0.0
 *
 * @package  namespace CustomCodeSnippetsManager\Middleware\SnippetsAuthMiddleware
 */

namespace CustomCodeSnippetsManager\Middleware;

use CustomCodeSnippetsManager\Helper;

defined( 'ABSPATH' ) || exit; // Exit if accessed directly.

/**
 * SnippetAuthMiddleware class.
 *
 * @since 1.0.0
 */
class SnippetsAuthMiddleware {
	/**
	 * Snippet access permissions.
	 *
	 * @param \WP_REST_Request $request The request data.
	 * @return true|\WP_Error
	 */
	public function check_access_permissions( $request ) {

		// Check if the current user has the necessary capability.
		if ( ! Helper::current_user_can_manage() ) {
			return new \WP_Error(
				'rest_forbidden',
				__( 'You do not have permission to manage snippets.', 'custom-code-snippets-manager' ),
				array( 'status' => 403 )
			);
		}

		// If everything is okay, return true to proceed.

		return true;
	}
}
