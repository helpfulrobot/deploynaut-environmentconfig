<?php

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
			'Variables' => htmlentities(json_encode($env->provideConfig()->getVariables()))
		));
	}

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

		// Convert back to associative array.
		$data = json_decode($request->postVar('variables'), true);
		$env->provideConfig()->setVariables($data);
	}

}
