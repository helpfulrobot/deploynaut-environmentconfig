<?php

namespace EnvironmentConfig;

class EnvironmentExtension extends \DataExtension {

	private static $has_one = array(
		'EnvironmentConfig' => 'EnvironmentConfig'
	);

	/**
	 * Expose the environment configuration backend.
	 */
	public function getEnvironmentConfigBackend() {

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

	/**
	 * Add the "configuration" menu item to the environment screen.
	 */
	public function updateMenu($list) {
		if (!$this->owner->config()->supports_environment_config) return;

		$controller = \Controller::curr();
		$actionType = $controller->getField('CurrentActionType');

		$list->push(new \ArrayData(array(
			'Link' => sprintf(
				'naut/project/%s/environment/%s/configuration',
				$this->owner->Project()->Name,
				$this->owner->Name
			),
			'Title' => 'Configuration',
			'IsCurrent' => $this->owner->isCurrent(),
			'IsSection' => $this->owner->isSection() && $actionType == Dispatcher::ACTION_CONFIGURATION
		)));
	}

}
