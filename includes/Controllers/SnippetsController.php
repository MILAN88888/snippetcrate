<?php
/**
 * Snippet Master SnippetsController class.
 *
 * @package  namespace SnippetMaster\Controllers\SnippetsController
 */

namespace SnippetMaster\Controllers;

use SnippetMaster\Models\Snippets;
use SnippetMaster\Helper;

/**
 * Add Snippets Routes class.
 *
 * @since 1.0.0
 */
class SnippetsController {
	/**
	 * Snippet model object.
	 *
	 * @var [object]
	 */
	protected $snippets;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->snippets = new Snippets();
	}

	/**
	 * Validate the snippet data.
	 *
	 * @param array $params The array of input data.
	 *
	 * @return array $errors The array of validation error messages.
	 */
	protected function validate_snippet_data( $params ) {
		$errors = array();
		$id     = isset( $params['id'] ) ? absint( $params['id'] ) : '';
		$title  = isset( $params['title'] ) ? sanitize_text_field( $params['title'] ) : '';

		if ( empty( $title ) ) {
			$errors['title'] = esc_html__( 'Title is required.', 'snippet-master' );
		} elseif ( ! is_string( $title ) || strlen( $title ) > 255 ) {
			$errors['title'] = esc_hmtl__( 'Title must be a string and less than 255 characters.', 'snippet-master' );
		}

		$codesnippet = isset( $params['codesnippet'] ) ? $params['codesnippet'] : '';
		$codesnippet = preg_replace( '|^\s*<\?(php)?|', '', $codesnippet );
		$codesnippet = preg_replace( '|\?>\s*$|', '', $codesnippet );

		if ( empty( $codesnippet ) ) {
			$errors['codesnippet'] = esc_html__( 'Code snippet is required.', 'snippet-master' );
		} elseif ( ! is_string( $codesnippet ) ) {
			$errors['codesnippet'] = esc_html__( 'Code snippet must be a string.', 'snippet-master' );
		}

		$priority = isset( $params['priority'] ) ? absint( $params['priority'] ) : '';

		if ( ! is_int( $priority ) ) {
			$errors['priority'] = esc_html__( 'Priority is required and must be an integer.', 'snippet-master' );
		} elseif ( $priority < 0 ) {
			$errors['priority'] = esc_html__( 'Priority must be a non-negative integer.', 'snippet-master' );
		}

		$description = isset( $params['description'] ) ? sanitize_text_field( $params['description'] ) : '';

		if ( empty( $description ) ) {
			$errors['description'] = esc_html__( 'Description is required.', 'snippet-master' );
		} elseif ( isset( $description ) && ! is_string( $description ) ) {
			$errors['description'] = esc_html__( 'Description must be a string.', 'snippet-master' );
		}

		$tags = isset( $params['tags'] ) ? sanitize_text_field( $params['tags'] ) : '';

		if ( isset( $ptags ) && ! is_string( $tags ) ) {
			$errors['tags'] = esc_html__( 'Tags must be a string.', 'snippet-master' );
		}
		$active = isset( $params['active'] ) ? absint( $params['active'] ) : 0;

		$data = compact( 'id', 'title', 'codesnippet', 'priority', 'description', 'tags', 'active' );

		return array(
			'errors' => $errors,
			'data'   => $data,
		);
	}

	/**
	 * Formating the save snippet data.
	 *
	 * @param [type] $request The request data.
	 *
	 * @return \WP_REST_Response The response object.
	 */
	public function save_snippets( $request ) {
		$params = $request->get_json_params();

		$validated_data = $this->validate_snippet_data( $params );

		if ( ! empty( $validated_data['errors'] ) ) {
			return new \WP_REST_Response(
				array(
					'message' => esc_html__( 'Validation failed. Please check the errors.', 'snippet-master' ),
					'errors'  => $validated_data['errors'],
				),
				400
			);
		}

		$res = $this->snippets->save_snippets( $validated_data['data'] );

		return new \WP_REST_Response(
			array( 'message' => $res ? esc_html__( 'Saved successfully!!', 'snippet-master' ) : esc_html__( 'Save Failed!!', 'snippet-master' ) ),
			200
		);
	}

	/**
	 * Get the snippet data.
	 *
	 * @param [type] $request The request data.
	 *
	 * @return \WP_REST_Response The response object.
	 */
	public function get_snippets( $request ) {
		$params = $request->get_params();

		$res = $this->snippets->get_snippets( $params );

		if ( isset( $res['results'][0] ) && ! empty( $res['results'][0] ) && 'PHP' === $res['results'][0]->lang ) {
			$res['results'][0]->codesnippet = '<?php' . $res['results'][0]->codesnippet;
		}
		return $res;
	}
	/**
	 * Update the snippets status.
	 *
	 * @param [array] $request The requested data.
	 * @return boolean|array
	 */
	public function update_status( $request ) {
		$params = $request->get_json_params();
		if ( ! isset( $params['id'] ) || empty( $params['id'] ) || ! isset( $params['active'] ) ) {
			return new \WP_REST_Response(
				array( 'message' => esc_html__( 'Failed to udpate!!', 'snippet-master' ) ),
				400
			);
		}
		// before update evaluting it's working.
		if ( $params['active'] && '1' == $params['active'] ) {

			$res = $this->snippets->get_snippets( array( 'id' => $params['id'] ) );

			// $output = Helper::php_syntax_error( $res['results'][0]->codesnippet );
		}
		return $this->snippets->update_status( $params ) ? $params : false;
	}
	/**
	 * Delete the snippets.
	 *
	 * @param [type] $request The request data.
	 *
	 * @return \WP_REST_Response The response object.
	 */
	public function delete_snippets( $request ) {
		$params = $request->get_json_params();

		if ( empty( $params ) ) {
			return new \WP_REST_Response(
				array( 'message' => esc_html__( 'Deletion failed!!', 'snippet-master' ) ),
				400
			);
		}

		return $this->snippets->delete_snippets( $params );
	}
	/**
	 * Get active snippets.
	 *
	 * @param [array] $params The params.
	 *
	 * @return boolean|array
	 */
	public function get_active_snippets( $params ) {
		return $this->snippets->get_snippets( $params );
	}
}
