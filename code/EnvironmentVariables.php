<?php

use Symfony\Component\Yaml\Yaml;

class EnvironmentVariables extends \DataObject {

	private static $db = array(
		'SHA' => 'Varchar',
		'Data' => 'Text'
	);

	private static $extensions = array(
		'Versioned'
	);

	private static $has_one = array(
		'Environment' => 'DNEnvironment'
	);

	public function newVersion($array) {
		$this->Data = Yaml::dump($array);
		$this->SHA = sha1($this->Data);
		$this->write();
	}

	public function getVersionArray($sha = null) {
		$data = $this->getVersionRaw($sha);

		if ($data) {
			return Yaml::parse($data);
		} else {
			return array();
		}
	}

	public function getVersionRaw($sha = null) {
		if (!$sha) {
			$v = $this;
		} else {
			// If SHA matches, it doesn't really matter which version is returned.
			$list = $this->allVersions(sprintf("\"SHA\"='%s'", $sha), 'LastEdited DESC', '1');
			if ($list) {
				$v = $list->first();
			}
		}

		if ($v) {
			return $v->Data;
		}

	}
}
