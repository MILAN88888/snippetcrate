<?php
/**
 * SnippetMaster Migration.
 *
 * @class Migration
 * @package SnippetMaster\Migration
 */

namespace SnippetMaster\Migration;

use SnippetMaster\Traits\Singleton;

/**
 * Migration class.
 *
 * @since 1.0.0
 */
class Migration {

	use Singleton;

	/**
	 * The name of the database connection to use.
	 *
	 * @var wpdb
	 */
	protected $connection;

	/**
	 * Database charset collation.
	 *
	 * @var string
	 */
	protected $charset_collate;

	/**
	 * Table prefix.
	 *
	 * @var string
	 */
	protected $prefix;

	/**
	 * Constructor.
	 */
	public function __construct() {
		global $wpdb;

		$this->connection      = $wpdb;
		$this->prefix          = $wpdb->prefix;
		$this->charset_collate = $this->get_collation();
		$this->setup();
	}

	/**
	 * Get the migration connection name.
	 *
	 * @return wpdb
	 */
	public function get_connection() {
		return $this->connection;
	}

	/**
	 * Get database collation.
	 *
	 * @return string
	 */
	protected function get_collation() {
		if ( ! $this->connection->has_cap( 'collation' ) ) {
			return '';
		}

		return $this->connection->get_charset_collate();
	}

	/**
	 * Set up the table to store the snippets.
	 *
	 * @since 1.0.0
	 *
	 * @return bool
	 */
	public function setup() {
		if ( ! function_exists( 'dbDelta' ) ) {
			require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		}

		$collation = $this->get_collation();

		$sql = "CREATE TABLE IF NOT EXISTS {$this->prefix}ccsnpt_snippets (
            id BIGINT(20) NOT NULL AUTO_INCREMENT,
            title TINYTEXT NOT NULL,
			lang VARCHAR(25) NOT NULL DEFAULT 'PHP',
            description TEXT NOT NULL,
            codesnippet LONGTEXT NOT NULL,
            tags LONGTEXT NOT NULL,
            scope VARCHAR(20) NOT NULL DEFAULT 'global',
            priority SMALLINT NOT NULL DEFAULT 10,
            active TINYINT(1) NOT NULL DEFAULT 0,
            created_by VARCHAR(255) NOT NULL,
            updated_by VARCHAR(255) NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) {$collation};";

		dbDelta( $sql );

		return true;
	}
}
