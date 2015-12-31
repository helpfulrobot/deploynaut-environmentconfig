<?php
/**
 * EnvironmentConfig\Backend defines access to the environment configuration storage.
 */

namespace EnvironmentConfig;

interface Backend
{

    /**
     * Create a new configuration version by updating the variables.
     * Replaces current configuration.
     *
     * @param array $array Associative array of variable => value to set.
     */
    public function setVariables($array);

    /**
     * Get the variables for given SHA.
     *
     * @param string $sha
     * @return array Associative array of variable => value.
     */
    public function getVariables($sha = null);

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
     * @return array
     */
    public function diffVariables($shaFrom, $shaTo = null);

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
}
