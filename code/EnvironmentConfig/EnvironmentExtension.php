<?php
/**
 * EnvironmentConfig\EnvironmentExtension surfaces EnvironmentConfig as a backend.
 * Other modules should not rely on the backend being a DataObject - it just so happens the concrete
 * implementation uses it.
 *
 * The only valid way to access the backend is through ->getEnvironmentConfigBackend() and the by using
 * the EnvironmentConfig\Backend methods.
 */

namespace EnvironmentConfig;

use Symfony\Component\Yaml\Yaml;

class EnvironmentExtension extends \DataExtension {

	/**
	 * Surface all configuration data to the admin area.
	 */
	public function updateCMSFields(FieldList $fields) {
		if (!$this->owner->Backend()->config()->supports_environment_config) return;
		if(!\Permission::check(Dispatcher::DEPLOYNAUT_ENVIRONMENT_CONFIG_WRITE)) return;

		$backend = $this->owner->getEnvironmentConfigBackend();

		$fields->addFieldsToTab('Root.Configuration', array(
			\TextareaField::create('Configuration', 'Configuration')
				->setValue($backend->getYaml())
				->setRows(30)
		));
	}

	/**
	 * Valildate.
	 */
	public function onBeforeWrite() {
		try {
			$this->owner->ConfigurationParsed = Yaml::parse($this->owner->Configuration);
		} catch (\Exception $e) {
			throw new \ValidationException(sprintf('Configuration is invalid, Yaml parser says: %s', $e->getMessage()));
		}
	}

	/**
	 * Flush the changes to the backend.
	 */
	public function onAfterWrite() {
		$backend = $this->owner->getEnvironmentConfigBackend();
		$backend->setArray($this->owner->ConfigurationParsed);
	}

	/**
	 * Expose the environment configuration backend.
	 * This function has a side effect of initialising the backend.
	 *
	 * @return Backend
	 */
	public function getEnvironmentConfigBackend() {
		// It just so happens the concrete implementation of the backend is based on the DataObjects.
		$config = \EnvironmentConfig::get()->filter('EnvironmentID', $this->owner->ID)->first();

		// We need to create the initial implementation of the backend somewhere,
		// there doesn't seem to be a better place to do it.
		if (!$config || !$config->ID) {
			$config = new \EnvironmentConfig();
			$config->EnvironmentID = $this->owner->ID;
			$config->write();
		}

		return $config;
	}

	/**
	 * Add the "configuration" menu item to the environment screen.
	 */
	public function updateMenu($list) {
		if (!$this->owner->Backend()->config()->supports_environment_config) return;
		if(!\Permission::check(Dispatcher::DEPLOYNAUT_ENVIRONMENT_CONFIG_WRITE)) return;

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
