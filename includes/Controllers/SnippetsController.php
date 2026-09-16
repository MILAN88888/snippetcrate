<?php
/**
 * Snippet Master SnippetsController class.
 *
 * @package  namespace CustomCodeSnippetsManager\Controllers\SnippetsController
 */

namespace CustomCodeSnippetsManager\Controllers;

defined( 'ABSPATH' ) || exit; // Exit if accessed directly.

use CustomCodeSnippetsManager\Models\Snippets;
use CustomCodeSnippetsManager\Helper;

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
			$errors['title'] = esc_html__( 'Title is required.', 'custom-code-snippets-manager' );
		} elseif ( strlen( $title ) > 255 ) {
			$errors['title'] = esc_html__( 'Title must be less than 255 characters.', 'custom-code-snippets-manager' );
		}

		$codesnippet = isset( $params['codesnippet'] ) && is_string( $params['codesnippet'] ) ? $params['codesnippet'] : '';
		$codesnippet = preg_replace( '|^\s*<\?(php)?|', '', $codesnippet );
		$codesnippet = preg_replace( '|\?>\s*$|', '', $codesnippet );

		$allowed_langs = array( 'PHP', 'JS', 'CSS', 'HTML' );
		$lang          = isset( $params['lang'] ) ? strtoupper( sanitize_text_field( $params['lang'] ) ) : 'PHP';
		if ( ! in_array( $lang, $allowed_langs, true ) ) {
			$lang = 'PHP';
		}

		if ( empty( $codesnippet ) ) {
			$errors['codesnippet'] = esc_html__( 'Code snippet is required.', 'custom-code-snippets-manager' );
		} elseif ( 'PHP' === $lang ) {
			$syntax_error = Helper::php_syntax_error( $codesnippet );
			if ( false !== $syntax_error ) {
				$errors['codesnippet'] = sprintf(
					/* translators: %s: PHP parse error message. */
					esc_html__( 'PHP syntax error: %s', 'custom-code-snippets-manager' ),
					$syntax_error
				);
			}
		}

		$priority = isset( $params['priority'] ) ? $params['priority'] : null;

		if ( null === $priority || '' === $priority || ! is_numeric( $priority ) ) {
			$errors['priority'] = esc_html__( 'Priority is required and must be an integer.', 'custom-code-snippets-manager' );
		} elseif ( (int) $priority < 0 ) {
			$errors['priority'] = esc_html__( 'Priority must be a non-negative integer.', 'custom-code-snippets-manager' );
		}
		$priority = absint( $priority );

		$description = isset( $params['description'] ) ? sanitize_text_field( $params['description'] ) : '';

		if ( empty( $description ) ) {
			$errors['description'] = esc_html__( 'Description is required.', 'custom-code-snippets-manager' );
		}

		$tags = isset( $params['tags'] ) ? sanitize_text_field( $params['tags'] ) : '';

		$allowed_scopes = array( 'global', 'header', 'footer', 'shortcode' );
		$scope          = isset( $params['scope'] ) ? sanitize_text_field( $params['scope'] ) : 'global';
		if ( ! in_array( $scope, $allowed_scopes, true ) ) {
			$errors['scope'] = esc_html__( 'Scope must be one of global, header, footer or shortcode.', 'custom-code-snippets-manager' );
		} elseif ( 'PHP' !== $lang && 'global' === $scope ) {
			$errors['scope'] = esc_html__( 'Only PHP snippets can use the global scope. Choose header, footer or shortcode.', 'custom-code-snippets-manager' );
		}

		$active = isset( $params['active'] ) ? absint( $params['active'] ) : 0;

		$data = compact( 'id', 'title', 'codesnippet', 'priority', 'description', 'tags', 'active', 'scope', 'lang' );

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
					'message' => esc_html__( 'Validation failed. Please check the errors.', 'custom-code-snippets-manager' ),
					'errors'  => $validated_data['errors'],
				),
				400
			);
		}

		$res = $this->snippets->save_snippets( $validated_data['data'] );

		return new \WP_REST_Response(
			array( 'message' => $res ? esc_html__( 'Saved successfully!!', 'custom-code-snippets-manager' ) : esc_html__( 'Save Failed!!', 'custom-code-snippets-manager' ) ),
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

		// Only re-add the opening tag for a single-snippet fetch (the editor); the
		// list query must not mutate its first row.
		if ( isset( $params['id'] ) && ! empty( $params['id'] )
			&& isset( $res['results'][0] ) && ! empty( $res['results'][0] )
			&& 'PHP' === $res['results'][0]->lang ) {
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
				array( 'message' => esc_html__( 'Failed to update!!', 'custom-code-snippets-manager' ) ),
				400
			);
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

		if ( empty( $params ) || ! is_array( $params ) ) {
			return new \WP_REST_Response(
				array( 'message' => esc_html__( 'Deletion failed!!', 'custom-code-snippets-manager' ) ),
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

	/**
	 * Live syntax check for the editor (does not save anything).
	 *
	 * Only PHP is checked here; JavaScript is validated in the browser.
	 *
	 * @param [type] $request The request data.
	 *
	 * @return \WP_REST_Response The response object.
	 */
	public function validate_syntax( $request ) {
		$params = $request->get_json_params();

		$code = isset( $params['codesnippet'] ) && is_string( $params['codesnippet'] )
			? $params['codesnippet']
			: '';
		$code = preg_replace( '|^\s*<\?(php)?|', '', $code );
		$code = preg_replace( '|\?>\s*$|', '', $code );

		$lang = isset( $params['lang'] ) ? strtoupper( sanitize_text_field( $params['lang'] ) ) : 'PHP';

		$error = false;
		if ( 'PHP' === $lang ) {
			$error = Helper::check_php_syntax( $code );
		}

		return new \WP_REST_Response(
			array(
				'valid'   => false === $error,
				'message' => $error ? $error['message'] : null,
				'line'    => $error ? $error['line'] : null,
			),
			200
		);
	}

	/**
	 * Duplicate a snippet.
	 *
	 * @param [type] $request The request data.
	 *
	 * @return \WP_REST_Response The response object.
	 */
	public function duplicate_snippet( $request ) {
		$params = $request->get_json_params();
		$id     = isset( $params['id'] ) ? absint( $params['id'] ) : 0;

		if ( ! $id ) {
			return new \WP_REST_Response(
				array( 'message' => esc_html__( 'Duplication failed!!', 'custom-code-snippets-manager' ) ),
				400
			);
		}

		$new_id = $this->snippets->duplicate_snippet( $id );

		return new \WP_REST_Response(
			array(
				'message' => $new_id
					? esc_html__( 'Snippet duplicated!!', 'custom-code-snippets-manager' )
					: esc_html__( 'Duplication failed!!', 'custom-code-snippets-manager' ),
				'id'      => $new_id ? $new_id : null,
			),
			$new_id ? 200 : 400
		);
	}

	/**
	 * Bulk update snippet active status.
	 *
	 * @param [type] $request The request data.
	 *
	 * @return \WP_REST_Response The response object.
	 */
	public function bulk_update_status( $request ) {
		$params = $request->get_json_params();
		$ids    = isset( $params['ids'] ) && is_array( $params['ids'] ) ? $params['ids'] : array();
		$active = isset( $params['active'] ) ? absint( $params['active'] ) : 0;

		if ( empty( $ids ) ) {
			return new \WP_REST_Response(
				array( 'message' => esc_html__( 'No snippets selected.', 'custom-code-snippets-manager' ) ),
				400
			);
		}

		$updated = $this->snippets->bulk_update_status( $ids, $active );

		return new \WP_REST_Response(
			array(
				'message' => $updated
					? esc_html__( 'Snippets updated!!', 'custom-code-snippets-manager' )
					: esc_html__( 'Update failed!!', 'custom-code-snippets-manager' ),
			),
			$updated ? 200 : 400
		);
	}

	/**
	 * Export snippets as a JSON payload or a PHP file body.
	 *
	 * @param [type] $request The request data.
	 *
	 * @return \WP_REST_Response The response object.
	 */
	public function export_snippets( $request ) {
		$params = $request->get_json_params();
		$ids    = isset( $params['ids'] ) && is_array( $params['ids'] )
			? array_map( 'absint', $params['ids'] )
			: array();
		$format = isset( $params['format'] ) && 'php' === $params['format'] ? 'php' : 'json';

		$rows   = $this->snippets->get_by_ids( $ids );
		$export = array();
		foreach ( $rows as $row ) {
			$export[] = array(
				'title'       => $row['title'],
				'lang'        => $row['lang'],
				'description' => $row['description'],
				'codesnippet' => $row['codesnippet'],
				'tags'        => $row['tags'],
				'scope'       => $row['scope'],
				'priority'    => (int) $row['priority'],
			);
		}

		if ( 'php' === $format ) {
			$content = "<?php\n";
			foreach ( $export as $snippet ) {
				if ( 'PHP' !== strtoupper( $snippet['lang'] ) ) {
					continue;
				}
				$content .= "\n/**\n * " . str_replace( "\n", "\n * ", $snippet['title'] ) . "\n";
				if ( ! empty( $snippet['description'] ) ) {
					$content .= ' * ' . str_replace( "\n", "\n * ", $snippet['description'] ) . "\n";
				}
				$content .= " */\n" . $snippet['codesnippet'] . "\n";
			}

			return new \WP_REST_Response(
				array(
					'format'   => 'php',
					'filename' => 'ccsm-export.php',
					'content'  => $content,
				),
				200
			);
		}

		return new \WP_REST_Response(
			array(
				'format'   => 'json',
				'filename' => 'ccsm-export.json',
				'snippets' => $export,
			),
			200
		);
	}

	/**
	 * Import snippets from a JSON payload. Imported snippets are inactive.
	 *
	 * @param [type] $request The request data.
	 *
	 * @return \WP_REST_Response The response object.
	 */
	public function import_snippets( $request ) {
		$params   = $request->get_json_params();
		$snippets = isset( $params['snippets'] ) && is_array( $params['snippets'] )
			? $params['snippets']
			: array();

		if ( empty( $snippets ) ) {
			return new \WP_REST_Response(
				array( 'message' => esc_html__( 'No snippets to import.', 'custom-code-snippets-manager' ) ),
				400
			);
		}

		$imported = 0;
		$skipped  = 0;
		foreach ( $snippets as $snippet ) {
			if ( ! is_array( $snippet ) ) {
				++$skipped;
				continue;
			}

			$validated = $this->validate_snippet_data( $snippet );
			if ( ! empty( $validated['errors'] ) ) {
				++$skipped;
				continue;
			}

			$data           = $validated['data'];
			$data['active'] = 0;
			unset( $data['id'] );

			if ( $this->snippets->save_snippets( $data ) ) {
				++$imported;
			} else {
				++$skipped;
			}
		}

		return new \WP_REST_Response(
			array(
				'message'  => sprintf(
					/* translators: 1: imported count, 2: skipped count. */
					esc_html__( 'Imported %1$d snippet(s), skipped %2$d.', 'custom-code-snippets-manager' ),
					$imported,
					$skipped
				),
				'imported' => $imported,
				'skipped'  => $skipped,
			),
			200
		);
	}

	/**
	 * Get the distinct list of tags across all snippets.
	 *
	 * @param [type] $request The request data.
	 *
	 * @return \WP_REST_Response The response object.
	 */
	public function get_tags( $request ) {
		return new \WP_REST_Response(
			array( 'tags' => $this->snippets->get_all_tags() ),
			200
		);
	}
}
