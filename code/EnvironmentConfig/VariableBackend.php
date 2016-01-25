<?php
/**
 * EnvironmentConfig\VariableConfig outlines an interface for storing and retrieving
 * _ss_environment variables from configuration.
 */

namespace EnvironmentConfig;

interface VariableBackend {

	/**
	 * Create a new configuration version by updating the variables.
	 * Replaces current configuration.
	 *
	 * @param array $array Associative array of variable => value to set.
	 * @param string|null Name of vhost the variables are being stored for.
	 */
	public function setVariables($array, $vhost = null);

	/**
	 * Get the variables for given SHA.
	 *
	 * @param string $sha
	 * @param string|null Name of vhost the variables are being retrieved for.
	 * @return array Associative array of variable => value.
	 */
	public function getVariables($sha = null, $vhost = null);

	/**
	 * Lists the differences in the following format:
	 * array(
	 *	'added' => array(... list of added variables),
	 *	'changed' => array(... list of changed variables),
	 *	'removed' => array(... list of removed variables),
	 * );
	 *
	 * @param string $shaFrom Originating SHA to compare from
	 * @param string $shaTo Target SHA to compare with
	 * @param string|null Name of vhost the variables are being diffed for.
	 * @return array
	 */
	public function diffVariables($shaFrom, $shaTo = null, $vhost = null);

}

