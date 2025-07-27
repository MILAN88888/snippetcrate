<?php
/**
 * Snippet Master Snippets class.
 *
 * @package  namespace SnippetMaster\Controllers\Snippets
 */

namespace SnippetMaster\Models;

/**
 * Snippets Model class.
 *
 * @since 1.0.0
 */
class Snippets {
	/**
	 * Save the snippet.
	 *
	 * @param [array] $data The snippet data.
	 *
	 * @return boolean
	 */
	public function save_snippets( $data ) {
		global $wpdb;

		if ( isset( $data['id'] ) && ! empty( $data['id'] ) ) {
			$id = $data['id'];
			unset( $data['id'] );

			return $wpdb->update(
				$wpdb->prefix . 'ccsnpt_snippets',
				$data,
				array( 'id' => $id )
			);
		} else {
			return $wpdb->insert(
				$wpdb->prefix . 'ccsnpt_snippets',
				$data
			);
		}
	}

	/**
	 * Get Snippets data.
	 *
	 * @param [array] $params The get params.
	 *
	 * @return array
	 */
	public function get_snippets( $params ) {
		global $wpdb;

		$sql       = "SELECT * FROM {$wpdb->prefix}ccsnpt_snippets";
		$count_sql = "SELECT COUNT(*) FROM {$wpdb->prefix}ccsnpt_snippets";
		if ( isset( $params['id'] ) && ! empty( $params['id'] ) ) {
			$sql    .= $wpdb->prepare( ' WHERE id = %d', $params['id'] );
			$results = $wpdb->get_results( $sql );

			return array(
				'results'     => $results,
				'total_count' => 1,
			);
		} else {
			$where_clause = array();
			if ( isset( $params['searchByItem'] ) && ! empty( $params['searchByItem'] ) ) {
				$like_item = '%' . $params['searchByItem'] . '%';

				$where_clause[] = $wpdb->prepare( ' `title`LIKE %s OR `description`LIKE %s OR `tags` LIKE %s', $like_item, $like_item, $like_item );
			}

			if ( isset( $params['startDate'] ) && isset( $params['endDate'] ) ) {
				$start_date     = empty( $params['startDate'] ) ? gmdate( 'Y-m-d' ) : gmdate( 'Y-m-d', strtotime( $params['startDate'] ) );
				$end_date       = empty( $params['endDate'] ) ? gmdate( 'Y-m-d' ) : gmdate( 'Y-m-d', strtotime( $params['endDate'] ) );
				$where_clause[] = $wpdb->prepare( ' `updated_at` BETWEEN %s AND %s', $start_date, $end_date );
			}
			if ( isset( $params['status'] ) ) {
				$status         = $params['status'];
				$where_clause[] = $wpdb->prepare( ' `active` = %s', $status );
			}
			if ( isset( $params['scope'] ) ) {
				if ( count( $params['scope'] ) > 0 ) {
					foreach ( $params['scope'] as $scope ) {
						$scope_where[] = $wpdb->prepare( ' `scope` = %s', $scope );
					}
					$where_clause[] = implode( ' OR ', $scope_where );

				} else {
					$where_clause[] = $wpdb->prepare( ' `scope` = %s', $params['scope'] );
				}
			}
			if ( ! empty( $where_clause ) ) {
				$where_sql  = ' WHERE ' . implode( ' AND ', $where_clause );
				$sql       .= $where_sql;
				$count_sql .= $where_sql;
			}

			$total_count = $wpdb->get_var( $count_sql );

			if ( isset( $params['limit'] ) || isset( $params['offset'] ) ) {
				$limit  = isset( $params['limit'] ) ? intval( $params['limit'] ) : 18446744073709551615;
				$offset = isset( $params['offset'] ) ? intval( $params['offset'] ) : 0;
				$sql   .= $wpdb->prepare( ' LIMIT %d, %d', ( $offset - 1 ) * $limit, $limit );
			}
		}

		$results = $wpdb->get_results( $sql );

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
		global $wpdb;

		return $wpdb->update( $wpdb->prefix . 'ccsnpt_snippets', array( 'active' => $params['active'] ), array( 'id' => $params['id'] ), array( '%s' ), array( '%d' ) );
	}
	/**
	 * Delete the snippets.
	 *
	 * @param [array] $ids The ids.
	 * @return boolean
	 */
	public function delete_snippets( $ids ) {
		global $wpdb;

		$ids_placeholders = implode( ',', array_fill( 0, count( $ids ), '%d' ) );

		$sql = $wpdb->prepare(
			"DELETE FROM {$wpdb->prefix}ccsnpt_snippets WHERE id IN ($ids_placeholders)",
			...$ids
		);
		return $wpdb->query( $sql );
	}
}
