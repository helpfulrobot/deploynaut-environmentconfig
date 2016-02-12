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

/**
 * Class EnvironmentExtension
 *
 */
class EnvironmentExtension extends \DataExtension {

	/**
	 * Surface all configuration data to the admin area.
	 *
	 * @param \FieldList $fields
	 */
	public function updateCMSFields(\FieldList $fields) {
		if (!$this->owner->Backend()->config()->supports_environment_config) return;

		$backend = $this->owner->getEnvironmentConfigBackend();

		$fields->addFieldsToTab('Root.Configuration', array(
			\TextareaField::create('Configuration', 'Configuration')
				->setValue($backend->getYaml())
				->setRows(30)
		));
	}

	/**
	 * Validate.
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
		$config = \DataObject::get('EnvironmentConfig\Config')->filter('EnvironmentID', $this->owner->ID)->first();

		// We need to create the initial implementation of the backend somewhere,
		// there doesn't seem to be a better place to do it.
		if (!$config || !$config->ID) {
			$config = new Config();
			$config->EnvironmentID = $this->owner->ID;
			$config->writeToStage('Stage');
			$config->publish('Stage', 'Live');
		}

		return $config;
	}

	/**
	 * Add the "configuration" menu item to the environment screen.
	 *
	 * @param \ArrayList $list
	 */
	public function updateMenu(\ArrayList $list) {
		if (!$this->owner->Backend()->config()->supports_environment_config) return;
		if(!$this->owner->Project()->allowed(VariableDispatcher::ALLOW_ENVIRONMENT_CONFIG_READ)) return;

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
			'IsSection' => $this->owner->isSection() && $actionType == VariableDispatcher::ACTION_CONFIGURATION
		)));
	}

}
