<?php

namespace EnvironmentVariables;

class BackendAccess extends \Extension {

	private static $backend = 'EnvironmentVariables\DBBackend';

	public function getVariablesBackend() {
		$class = \Config::inst()->get('EnvironmentVariables\BackendAccess', 'backend');
		return new $class($this->owner);
	}

}
