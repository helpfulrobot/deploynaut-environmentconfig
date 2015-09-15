<?php

namespace EnvironmentVariables;

class DBBackend extends \Object implements Backend {

	protected $config;

	public function __construct($environment) {
		$configs = \EnvironmentVariables::get()->filter('EnvironmentID', $environment->ID);

		// Ensure config exists for this environment.
		$count = $configs->count();
		if ($count>1) {
			throw new \RuntimeException('More than one config found for environment %s', $environment->Name);
		} else if ($count==0) {
			$this->config = new \EnvironmentVariables();
			$this->config->EnvironmentID = $environment->ID;
			$this->config->write();
		} else {
			$this->config = $configs->first();
		}
	}

	public function newVersion($array) {
		$this->config->newVersion($array);
	}

	public function getRaw($sha = null) {
		if (!$sha) return $this->config->Data;
		return $this->config->getVersionRaw($sha);
	}

	public function getArray($sha = null) {
		return $this->config->getVersionArray($sha);
	}

	public function getLatestSha() {
		return $this->config->SHA;
	}

	public function diff($versionFrom, $versionTo = null) {
		if ($versionFrom) {
			$from = $this->config->getVersionArray($versionFrom);
		} else {
			$from = array();
		}

		if ($versionTo) {
			$to = $this->config->getVersionArray($versionTo);
		} else {
			$to = array();
		}

		// Note the differences by writting down the keys that changed.
		$diff = array();
		$removed = array_keys(array_diff_key($from, $to));
		if (!empty($removed)) $diff['removed'] = $removed;

		$added = array_keys(array_diff_key($to, $from));
		if (!empty($added)) $diff['added'] = $added;

		$changed = array();
		foreach ($from as $key => $val) {
			if (!empty($from[$key]) && !empty($to[$key])) {
				if ($from[$key]!==$to[$key]) $diff['changed'][] = $key;
			}
		}

		if (!empty($changed)) $diff['changed'] = $changed;

		return $diff;
	}
	
}
