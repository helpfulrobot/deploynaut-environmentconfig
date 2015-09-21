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
