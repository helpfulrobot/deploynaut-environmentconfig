<?php
/**
 * EnvironmentConfig\Backend defines access to the environment configuration storage.
 */

namespace EnvironmentConfig;

interface Backend {

	/**
	 * Return the non-canonical data for the SHA.
	 *
	 * @param string $sha
	 * @return array
	 */
	public function getArray($sha = null);

	/**
	 * Create a new configuration version from the array.
	 *
	 * @param array $array Deep associative array to replace the current configuraiton.
	 */
	public function setArray($array);

	/**
	 * Return the canonical data for the SHA. This data must produce the SHA after applying sha1.
	 *
	 * @param string $sha
	 * @return string YAML payload
	 */
	public function getYaml($sha = null);

	/**
	 * Get the latest available revision SHA.
	 *
	 * @return string Latest SHA
	 */
	public function getLatestSha();

	/**
	 * Adds a vhost to config
	 *
	 * @param string $vhost
	 *
	 * @return null
	 */
	public function addVhost($vhost);

	/**
	 * Removes a vhost from config
	 *
	 * @param string $vhost
	 *
	 * @return null
	 */
	public function removeVhost($vhost);

	/**
	 * Checks if a vhost already exists in config
	 *
	 * @param string $vhost
	 *
	 * @return null
	 */
	public function hasVhost($vhost);

}
