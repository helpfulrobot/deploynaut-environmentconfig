<?php
/**
 * EnvironmentConfig\Dispatcher provides controller methods for the environment configuration.
 */

namespace EnvironmentConfig;

class Dispatcher extends \Extension {

	public static $allowed_actions = array(
		'configuration',
		'save'
	);

	const ACTION_CONFIGURATION = 'configuration';

	private static $action_types = array(
		self::ACTION_CONFIGURATION
	);

	/**
	 * Render configuration form.
	 */
	public function configuration() {
		$this->owner->setCurrentActionType(self::ACTION_CONFIGURATION);

		// Performs canView permission check by limiting visible projects
		$project = $this->owner->getCurrentProject();
		if(!$project) {
			return $this->project404Response();
		}

		// Performs canView permission check by limiting visible projects
		$env = $this->owner->getCurrentEnvironment($project);
		if(!$env) {
			return $this->environment404Response();
		}

		if (\Director::isDev()) {
			\Requirements::javascript('deploynaut-environmentconfig/static/bundle-debug.js');
		} else {
			\Requirements::javascript('deploynaut-environmentconfig/static/bundle.js');
		}

		\Requirements::css('deploynaut-environmentconfig/static/style.css');

		return $this->owner->render(array(
			'Variables' => htmlentities(json_encode($env->getEnvironmentConfigBackend()->getVariables()))
		));
	}

	/**
	 * Store new version of variables.
	 */
	public function save($request) {
		$this->owner->setCurrentActionType(self::ACTION_CONFIGURATION);

		// Performs canView permission check by limiting visible projects
		$project = $this->owner->getCurrentProject();
		if(!$project) {
			return $this->project404Response();
		}

		// Performs canView permission check by limiting visible projects
		$env = $this->owner->getCurrentEnvironment($project);
		if(!$env) {
			return $this->environment404Response();
		}

		$data = json_decode($request->postVar('variables'), true);
		$env->getEnvironmentConfigBackend()->setVariables($data);
	}

}
