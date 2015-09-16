<?php

use Symfony\Component\Yaml\Yaml;

class EnvironmentConfig extends DataObject implements \EnvironmentConfig\Backend {

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

	public function setVariables($array) {
		$data = $this->getVersionDataArray();
		$data['mysite::_ss_env'] = $array;
		$this->writeVersionFromArray($data);

		return $this->SHA;
	}

	public function getVariables($sha = null) {
		$data = $this->getVersionDataArray($sha);
		if (!empty($data['mysite::_ss_env'])) return $data['mysite::_ss_env'];

		return array();
	}

	public function diffVariables($shaFrom, $shaTo = null) {
		if ($shaFrom===$shaTo) return array();

		if ($shaFrom) {
			$from = $this->getVariables($shaFrom);
		} else {
			$from = array();
		}

		if ($shaTo) {
			$to = $this->getVariables($shaTo);
		} else {
			$to = array();
		}

		// Note the differences by writting down the keys that changed.
		$diff = array();

		$added = array_keys(array_diff_key($to, $from));
		if (!empty($added)) $diff['added'] = $added;

		$changed = array();
		foreach ($from as $key => $val) {
			if (!empty($from[$key]) && !empty($to[$key])) {
				if ($from[$key]!==$to[$key]) $diff['changed'][] = $key;
			}
		}
		if (!empty($changed)) $diff['changed'] = $changed;

		$removed = array_keys(array_diff_key($from, $to));
		if (!empty($removed)) $diff['removed'] = $removed;


		return $diff;
	}

	public function getYaml($sha = null) {
		if (!$sha) return $this->Data;
		return $this->getVersionData($sha);
	}

	public function getLatestSha() {
		return $this->SHA;
	}

	public function onBeforeWrite() {
		parent::onBeforeWrite();
		$this->SHA = sha1($this->Data);
	}

	protected function writeVersionFromArray($array) {
		$this->Data = Yaml::dump($array);
		// Only write if the data differs.
		if (sha1($this->Data)!==$this->SHA) $this->write();
	}

	protected function getVersionDataArray($sha = null) {
		$data = $this->getVersionData($sha);

		if ($data) {
			return Yaml::parse($data);
		} else {
			return array();
		}
	}

	protected function getVersionData($sha = null) {
		if (!$sha) {
			$v = $this;
		} else {
			// If SHA matches, it doesn't really matter which version is returned because the data will match.
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
