<?php
/**
 * EnvironmentConfig\Dispatcher provides controller methods for the environment configuration.
 */

namespace EnvironmentConfig;

class Dispatcher extends \Dispatcher implements \PermissionProvider {

	const ACTION_CONFIGURATION = 'configuration';

	const ALLOW_ENVIRONMENT_CONFIG_READ = 'ALLOW_ENVIRONMENT_CONFIG_READ';
	const ALLOW_ENVIRONMENT_CONFIG_WRITE = 'ALLOW_ENVIRONMENT_CONFIG_WRITE';

	public static $allowed_actions = array(
		'save'
	);

	private static $action_types = array(
		self::ACTION_CONFIGURATION
	);

	/**
	 * @var \DNProject
	 */
	protected $project = null;

	/**
	 * @var \DNEnvironment
	 */
	protected $environment = null;

	public function init() {
		parent::init();

		$this->project = $this->getCurrentProject();
		if(!$this->project) {
			return $this->project404Response();
		}

		if(!$this->project->allowed(self::ALLOW_ENVIRONMENT_CONFIG_READ)) {
			return \Security::permissionFailure();
		}

		// Performs canView permission check by limiting visible projects
		$this->environment = $this->getCurrentEnvironment($this->project);
		if(!$this->environment) {
			return $this->environment404Response();
		}
	}

	/**
	 * Render configuration form.
	 *
	 * @param \SS_HTTPRequest $request
	 *
	 * @return \HTMLText|\SS_HTTPResponse
	 */
	public function index(\SS_HTTPRequest $request) {
		$this->setCurrentActionType(self::ACTION_CONFIGURATION);

		\Requirements::css('deploynaut-environmentconfig/static/style.css');

		$model = $this->getModel('EnvironmentConfig');

		return $this->customise([
			'Model' => htmlentities(json_encode($model)),
			'AllowedToRead' => $this->project->whoIsAllowed(self::ALLOW_ENVIRONMENT_CONFIG_READ),
			'Environment' => $this->environment
		])->renderWith(array('EnvironmentConfig_configuration', 'DNRoot'));
	}

	/**
	 * @param string $name
	 *
	 * @return array
	 */
	public function getModel($name) {
		$model = [
			'FormAction' => \Controller::join_links($this->environment->Link(), '/configuration/save'),
			'Blacklist' => [],
			'Variables' => [],
		];

		$vhost = !empty($this->project->Vhost) ? $this->project->Vhost : null;
		$model['Variables'] = $this->environment->getEnvironmentConfigBackend()->getVariables(null, $vhost);

		if($this->environment->Backend()->config()->environment_config_blacklist) {
			$model['Blacklist'] = $this->environment->Backend()->config()->environment_config_blacklist;
		}

		return $model;
	}

	/**
	 * Store new version of variables.
	 *
	 * @param \SS_HTTPRequest $request
	 *
	 * @return \SS_HTTPResponse|void
	 */
	public function save(\SS_HTTPRequest $request) {
		$this->setCurrentActionType(self::ACTION_CONFIGURATION);

		$this->checkSecurityToken();

		if(!$this->project->allowed(self::ALLOW_ENVIRONMENT_CONFIG_WRITE)) {
			return \Security::permissionFailure();
		}

		$data = $this->getFormData();

		// Validate against unsafe inputs.
		$blacklist = $this->environment->Backend()->config()->environment_config_blacklist ?: array();
		if (!empty($blacklist)) foreach ($data as $variable => $value) {
			foreach ($blacklist as $filter) {
				if (preg_match("/$filter/", $variable)) {
					return new \SS_HTTPResponse(sprintf('Variable %s is blacklisted.', $variable), 403);
				}
			}
		}

		// Coerce risky "false" value.
		$message = null;
		$changed = [];
		foreach ($data as $variable => $value) {
			if ($value==="false") {
				$data[$variable] = '0';
				$changed[] = $variable;
			}
		}
		if (!empty($changed)) {
			$message = sprintf(
				'We have converted some of the values to "0" to avoid the ambiguity of "false" string '
				. 'which resolves to true in PHP boolean context. '
				. 'The following variable values have been changed: %s.',
				implode(', ', $changed)
			);
		}

		ksort($data);

		$vhost = !empty($this->project->Vhost) ? $this->project->Vhost : null;
		$this->environment->getEnvironmentConfigBackend()->setVariables($data, $vhost);

		return $this->asJSON([
			'Variables' => $this->environment->getEnvironmentConfigBackend()->getVariables(null, $vhost),
			'Message' => $message
		]);
	}

	/**
	 * @return array
	 */
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
