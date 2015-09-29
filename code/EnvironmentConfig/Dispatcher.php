<?php
/**
 * EnvironmentConfig\Dispatcher provides controller methods for the environment configuration.
 */

namespace EnvironmentConfig;

class Dispatcher extends \DNRoot implements \PermissionProvider {

	const ACTION_CONFIGURATION = 'configuration';

	const ALLOW_ENVIRONMENT_CONFIG_READ = 'ALLOW_ENVIRONMENT_CONFIG_READ';
	const ALLOW_ENVIRONMENT_CONFIG_WRITE = 'ALLOW_ENVIRONMENT_CONFIG_WRITE';

	public static $allowed_actions = array(
		'save'
	);

	private static $action_types = array(
		self::ACTION_CONFIGURATION
	);

	public function init() {
		parent::init();

		$project = $this->getCurrentProject();
		if(!$project) {
			return $this->project404Response();
		}

		if(!$project->allowed(self::ALLOW_ENVIRONMENT_CONFIG_READ)) {
			return \Security::permissionFailure();
		}
	}

	/**
	 * Render configuration form.
	 */
	public function index(SS_HTTPRequest $request) {
		$this->setCurrentActionType(self::ACTION_CONFIGURATION);

		// Performs canView permission check by limiting visible projects
		$project = $this->getCurrentProject();
		if(!$project) {
			return $this->project404Response();
		}

		// Performs canView permission check by limiting visible projects
		$env = $this->getCurrentEnvironment($project);
		if(!$env) {
			return $this->environment404Response();
		}

		if (\Director::isDev()) {
			\Requirements::javascript('deploynaut-environmentconfig/static/bundle-debug.js');
		} else {
			\Requirements::javascript('deploynaut-environmentconfig/static/bundle.js');
		}

		\Requirements::css('deploynaut-environmentconfig/static/style.css');

		$blacklist = $env->Backend()->config()->environment_config_blacklist ?: array();
		return $this->customise(array(
			'Variables' => htmlentities(json_encode($env->getEnvironmentConfigBackend()->getVariables())),
			'Blacklist' => htmlentities(json_encode($blacklist))
		))->renderWith(array('EnvironmentConfig_configuration', 'DNRoot'));
	}

	/**
	 * Store new version of variables.
	 */
	public function save(SS_HTTPRequest $request) {
		$this->setCurrentActionType(self::ACTION_CONFIGURATION);

		// Performs canView permission check by limiting visible projects
		$project = $this->getCurrentProject();
		if(!$project) {
			return $this->project404Response();
		}

		if(!$project->allowed(self::ALLOW_ENVIRONMENT_CONFIG_WRITE)) {
			return \Security::permissionFailure();
		}

		// Performs canView permission check by limiting visible projects
		$env = $this->getCurrentEnvironment($project);
		if(!$env) {
			return $this->environment404Response();
		}

		$data = json_decode($request->postVar('variables'), true);

		// Validate against unsafe inputs.
		$blacklist = $env->Backend()->config()->environment_config_blacklist ?: array();
		if (!empty($blacklist)) foreach ($data as $variable => $value) {
			foreach ($blacklist as $filter) {
				if (preg_match("/$filter/", $variable)) {
					return new \SS_HTTPResponse(sprintf('Variable %s is blacklisted.', $variable), 403);
				}
			}
		}

		$env->getEnvironmentConfigBackend()->setVariables($data);
	}

	public function providePermissions() {
		return array(
			self::ALLOW_ENVIRONMENT_CONFIG_READ => array(
				'name' => "Read access to environment configuration",
				'category' => "Deploynaut",
			),
			self::ALLOW_ENVIRONMENT_CONFIG_WRITE => array(
				'name' => "Write access to environment configuration",
				'category' => "Deploynaut",
			)
		);
	}
}
