<?php
/**
 * Snippet Master uninstall.
 *
 * Removes the plugin's custom table and options when the plugin is deleted from
 * the WordPress admin. Runs on every site of a multisite network.
 *
 * @package SnippetMaster
 */

// Exit if accessed directly or not called by WordPress during uninstall.
defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

/**
 * Delete the Snippet Master table and options for the current site.
 *
 * @return void
 */
function ccsnpt_uninstall_cleanup() {
	global $wpdb;

	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- One-off schema teardown on uninstall; caching is irrelevant.
	$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}ccsnpt_snippets" );

	delete_option( 'ccsnpt_db_version' );
}

if ( is_multisite() ) {
	$ccsnpt_site_ids = get_sites(
		array(
			'fields' => 'ids',
			'number' => 0,
		)
	);

	foreach ( $ccsnpt_site_ids as $ccsnpt_site_id ) {
		switch_to_blog( $ccsnpt_site_id );
		ccsnpt_uninstall_cleanup();
		restore_current_blog();
	}
} else {
	ccsnpt_uninstall_cleanup();
}
