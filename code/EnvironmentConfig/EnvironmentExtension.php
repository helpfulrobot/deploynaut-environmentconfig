<?php

namespace EnvironmentConfig;

class EnvironmentExtension extends \DataExtension {

	private static $has_one = array(
		'EnvironmentConfig' => 'EnvironmentConfig'
	);

	/**
	 * Ensures EnvironmentConfig object is returned, even if it doesn't exist yet.
	 */
	public function provideConfig() {

		if (!$this->owner->EnvironmentConfigID || !$this->owner->EnvironmentConfig()->ID) {
			$config = new \EnvironmentConfig();
			$config->EnvironmentID = $this->owner->ID;
			$config->write();

			$this->owner->EnvironmentConfigID = $config->ID;
			$this->owner->write();

		} else {
			$config = $this->owner->EnvironmentConfig();
		}

		return $config;
	}

}
