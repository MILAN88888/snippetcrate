<?php
/**
 * Snippet Master Snippets class.
 *
 * @package  namespace CustomCodeSnippetsManager\Controllers\Snippets
 */

namespace CustomCodeSnippetsManager\Models;

defined( 'ABSPATH' ) || exit; // Exit if accessed directly.

/**
 * Snippets Model class.
 *
 * @since 1.0.0
 */
class Snippets {
	/**
	 * The name of the database connection to use.
	 *
	 * @var wpdb
	 */
	protected $con;

	/**
	 * Snippets constructor.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		global $wpdb;

		$this->con = $wpdb;
	}

	/**
	 * Save the snippet.
	 *
	 * @param [array] $data The snippet data.
	 *
	 * @return boolean
	 */
	public function save_snippets( $data ) {
		$user_id = get_current_user_id();

		if ( isset( $data['id'] ) && ! empty( $data['id'] ) ) {
			$id = $data['id'];
			unset( $data['id'] );
			$data['updated_by'] = $user_id;

			return $this->con->update(
				$this->con->prefix . 'ccsnpt_snippets',
				$data,
				array( 'id' => $id )
			);
		}

		unset( $data['id'] );
		$data['created_by'] = $user_id;
		$data['updated_by'] = $user_id;

		return $this->con->insert(
			$this->con->prefix . 'ccsnpt_snippets',
			$data
		);
	}

	/**
	 * Get Snippets data.
	 *
	 * @param [array] $params The get params.
	 *
	 * @return array
	 */
	public function get_snippets( $params ) {
        $where_clause = array();
        $query_args = array();
        $sql = "SELECT * FROM {$this->con->prefix}ccsnpt_snippets";
        $count_sql = "SELECT COUNT(*) FROM {$this->con->prefix}ccsnpt_snippets";

        if ( isset( $params['id'] ) && ! empty( $params['id'] ) ) {
            $sql = $this->con->prepare(
                "SELECT * FROM {$this->con->prefix}ccsnpt_snippets WHERE id = %d",
                absint( $params['id'] )
            );
            $results = $this->con->get_results( $sql );

            return array(
                'results'     => $results,
                'total_count' => 1,
            );
        }

        if ( isset( $params['searchByItem'] ) && ! empty( $params['searchByItem'] ) ) {
            $like_item = '%' . $this->con->esc_like( $params['searchByItem'] ) . '%';
            $where_clause[] = "(`title` LIKE %s OR `description` LIKE %s OR `tags` LIKE %s)";
            array_push( $query_args, $like_item, $like_item, $like_item );
        }

        if ( ! empty( $params['startDate'] ) && ! empty( $params['endDate'] ) ) {
            $start_date = gmdate( 'Y-m-d', strtotime( $params['startDate'] ) ) . ' 00:00:00';
            $end_date   = gmdate( 'Y-m-d', strtotime( $params['endDate'] ) ) . ' 23:59:59';

            $where_clause[] = "`updated_at` BETWEEN %s AND %s";
            array_push( $query_args, $start_date, $end_date );
        }

        if ( isset( $params['status'] ) && '' !== $params['status'] ) {
            $where_clause[] = "`active` = %s";
            $query_args[] = $params['status'];
        }

        if ( isset( $params['tag'] ) && '' !== $params['tag'] ) {
            $where_clause[] = "`tags` LIKE %s";
            $query_args[]   = '%' . $this->con->esc_like( $params['tag'] ) . '%';
        }

        if ( isset( $params['lang'] ) && '' !== $params['lang'] ) {
            $lang = strtoupper( sanitize_text_field( $params['lang'] ) );
            if ( in_array( $lang, array( 'PHP', 'JS', 'CSS', 'HTML' ), true ) ) {
                $where_clause[] = '`lang` = %s';
                $query_args[]   = $lang;
            }
        }

        if ( isset( $params['scope'] ) ) {
            if ( is_array( $params['scope'] ) && count( $params['scope'] ) > 0 ) {
                $scope_placeholders = implode( ',', array_fill( 0, count( $params['scope'] ), '%s' ) );
                $where_clause[] = "`scope` IN ($scope_placeholders)";
                $query_args = array_merge(
                    $query_args,
                    array_map( 'sanitize_text_field', $params['scope'] )
                );
            } else {
                $where_clause[] = "`scope` = %s";
                $query_args[] = $params['scope'];
            }
        }

        // Prepare the SQL
        if ( ! empty( $where_clause ) ) {
            $where_sql = ' WHERE ' . implode( ' AND ', $where_clause );
            $sql .= $where_sql;
            $count_sql .= $where_sql;
        }

        // Get total count (before appending pagination placeholders/args).
        if ( ! empty( $query_args ) ) {
            $count_sql = $this->con->prepare( $count_sql, $query_args );
        }
        $total_count = $this->con->get_var( $count_sql );

        // Handle pagination. `offset` is a 1-based page number.
        if ( isset( $params['limit'] ) ) {
            $limit = absint( $params['limit'] );
            $limit = $limit > 0 ? $limit : 10;
            $page  = isset( $params['offset'] ) ? max( 1, absint( $params['offset'] ) ) : 1;

            $sql         .= ' LIMIT %d, %d';
            $query_args[] = ( $page - 1 ) * $limit;
            $query_args[] = $limit;
        }

        // Get results (single prepare with the full argument list).
        if ( ! empty( $query_args ) ) {
            $sql = $this->con->prepare( $sql, $query_args );
        }
        $results = $this->con->get_results( $sql );

        return array(
            'results'     => $results,
            'total_count' => $total_count,
        );
    }
	/**
	 * Update the snippet status.
	 *
	 * @param [array] $params The params.
	 * @return boolean
	 */
	  public function update_status( $params ) {
        if ( ! isset( $params['id'] ) || ! isset( $params['active'] ) ) {
            return false;
        }

        return false !== $this->con->update(
            $this->con->prefix . 'ccsnpt_snippets',
            array( 'active' => $params['active'] ),
            array( 'id' => $params['id'] ),
            array( '%s' ),
            array( '%d' )
        );
    }

	/**
	 * Delete the snippets.
	 *
	 * @param [array] $ids The ids.
	 * @return boolean
	 */
	  public function delete_snippets( $ids ) {
        if ( empty( $ids ) ) {
            return false;
        }

        $ids = array_map( 'absint', $ids );
        $placeholders = implode( ',', array_fill( 0, count( $ids ), '%d' ) );

        $sql = $this->con->prepare(
            "DELETE FROM {$this->con->prefix}ccsnpt_snippets WHERE id IN ($placeholders)",
            ...$ids
        );

        return false !== $this->con->query( $sql );
    }

	/**
	 * Duplicate a snippet.
	 *
	 * @param int $id The snippet id to duplicate.
	 * @return int|false The new snippet id, or false on failure.
	 */
	public function duplicate_snippet( $id ) {
		$id = absint( $id );
		if ( ! $id ) {
			return false;
		}

		$row = $this->con->get_row(
			$this->con->prepare(
				"SELECT * FROM {$this->con->prefix}ccsnpt_snippets WHERE id = %d",
				$id
			),
			ARRAY_A
		);

		if ( ! $row ) {
			return false;
		}

		unset( $row['id'], $row['created_at'], $row['updated_at'] );
		$row['title']  = $row['title'] . ' (copy)';
		$row['active'] = 0;

		$inserted = $this->con->insert( $this->con->prefix . 'ccsnpt_snippets', $row );

		return $inserted ? $this->con->insert_id : false;
	}

	/**
	 * Bulk update the active status of the given snippets.
	 *
	 * @param array $ids    The snippet ids.
	 * @param int   $active The active flag (1 or 0).
	 * @return boolean
	 */
	public function bulk_update_status( $ids, $active ) {
		if ( empty( $ids ) || ! is_array( $ids ) ) {
			return false;
		}

		$ids          = array_map( 'absint', $ids );
		$placeholders = implode( ',', array_fill( 0, count( $ids ), '%d' ) );

		$sql = $this->con->prepare(
			"UPDATE {$this->con->prefix}ccsnpt_snippets SET active = %d WHERE id IN ($placeholders)",
			array_merge( array( absint( $active ) ), $ids )
		);

		return false !== $this->con->query( $sql );
	}

	/**
	 * Get snippet rows by ids (or all rows when no ids given).
	 *
	 * @param array $ids The snippet ids.
	 * @return array
	 */
	public function get_by_ids( $ids ) {
		if ( empty( $ids ) ) {
			return $this->con->get_results(
				"SELECT * FROM {$this->con->prefix}ccsnpt_snippets",
				ARRAY_A
			);
		}

		$ids          = array_map( 'absint', $ids );
		$placeholders = implode( ',', array_fill( 0, count( $ids ), '%d' ) );

		return $this->con->get_results(
			$this->con->prepare(
				"SELECT * FROM {$this->con->prefix}ccsnpt_snippets WHERE id IN ($placeholders)",
				$ids
			),
			ARRAY_A
		);
	}

	/**
	 * Get the distinct list of tags used across all snippets.
	 *
	 * @return array
	 */
	public function get_all_tags() {
		$rows = $this->con->get_col(
			"SELECT tags FROM {$this->con->prefix}ccsnpt_snippets WHERE tags <> ''"
		);

		$tags = array();
		foreach ( $rows as $row ) {
			foreach ( explode( ',', $row ) as $tag ) {
				$tag = trim( $tag );
				if ( '' !== $tag ) {
					$tags[ $tag ] = true;
				}
			}
		}

		$tags = array_keys( $tags );
		sort( $tags );

		return $tags;
	}
}
