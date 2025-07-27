<?php
/**
 * Snippet Auth Middleware Class.
 *
 * @since 1.0.0
 *
 * @package  namespace SnippetMaster\Middleware\SnippetsAuthMiddleware
 */

namespace SnippetMaster\Middleware;

/**
 * SnippetAuthMiddleware class.
 *
 * @since 1.0.0
 */
class SnippetsAuthMiddleware {
	/**
	 * Snippet access permissions.
	 *
	 * @param [type] $request The request data.
	 */
	public function check_access_permissions( $request ) {

		// Check if the current user has the necessary capability.
		if ( ! current_user_can( 'manage_options' ) ) {
			return new \WP_Error(
				'rest_forbidden',
				__( 'You do not have permissions to delete snippets.', 'snippet-master' ),
				array( 'status' => 403 )
			);
		}

		// If everything is okay, return true to proceed.

		return true;
	}
}
