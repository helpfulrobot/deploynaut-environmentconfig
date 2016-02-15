<?php
/**
 * EnvironmentConfig\Config stores configurations in the SilverStripe's database,
 * and versions them using Versioned API. Versions are keyed by SHA.
 */

namespace EnvironmentConfig;

use Symfony\Component\Yaml\Yaml;

class Config extends \DataObject implements \EnvironmentConfig\Backend, \EnvironmentConfig\VariableBackend {

	private static $db = array(
		'SHA' => 'Varchar',
		'Data' => 'Text'
	);

	private static $indexes = array(
		'SHA' => true
	);

	private static $extensions = array(
		'Versioned'
	);

	private static $has_one = array(
		'Environment' => 'DNEnvironment'
	);

	public function setVariables($array, $vhost = null) {
		$data = $this->getArray();

		// Only updating the environment variables.
		if (empty($vhost) || $vhost=='mysite') {
			$data['mysite::_ss_env'] = $array;
		} else {
			if(!$this->hasVhost($vhost)) {
				throw new \Exception("$vhost doesn't exist in configuration.");
			}

			// Initialise the much deeper array needed to store vhost variables.
			$current = &$data;
			$elems = array(
				'ss_vhost::vhosts',
				$vhost,
				'customisations',
				'mysite::vhost',
				'user_defines'
			);
			foreach($elems as $elem) {
				if (!isset($current[$elem])) {
					$current[$elem] = array();
				}
				$current = &$current[$elem];
			}

			$current = $array;
		}

		$this->setArray($data);
	}

	public function getVariables($sha = null, $vhost = null) {
		$data = $this->getArray($sha);

		// Only interested in the environment variables.
		if (empty($vhost) || $vhost=='mysite') {
			if (!empty($data['mysite::_ss_env'])) return $data['mysite::_ss_env'];
		} else {
			if (!empty($data['ss_vhost::vhosts'][$vhost]['customisations']['mysite::vhost']['user_defines'])) {
				return $data['ss_vhost::vhosts'][$vhost]['customisations']['mysite::vhost']['user_defines'];
			}
		}

		return array();
	}

	public function diffVariables($shaFrom, $shaTo = null, $vhost = null) {
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

		// Produce listings of keys that are changing.
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

	public function getArray($sha = null) {
		$data = $this->getYaml($sha);

		if ($data) {
			return Yaml::parse($data);
		} else {
			return array();
		}
	}

	public function setArray($array) {
		// Prevent Yaml parser from inlining arrays by setting the threshold really high.
		$this->Data = Yaml::dump($array, 1000);
		// Only write if the data differs.
		if (sha1($this->Data)!==$this->SHA) {
			$this->writeToStage('Stage');
			$this->publish('Stage', 'Live');
		}
	}

	public function getYaml($sha = null) {
		if (!$sha) {
			$v = $this;
		} else {
			// If SHA matches, it doesn't really matter which version is returned because the data will match.
			$list = $this->allVersions(sprintf("\"SHA\"='%s'", $sha), 'LastEdited DESC', '1');
			if ($list) {
				$v = $list->first();
			}
		}

		if (isset($v) && $v) {
			return $v->Data;
		}

		return '';
	}

	public function getLatestSha() {
		return $this->SHA;
	}

	public function addVhost($vhost) {
		if($this->hasVhost($vhost)) {
			return;
		}

		$vhost = strtolower($vhost);
		$data = $this->getArray();
		
		if(!isset($data['ss_vhost::vhosts'])) {
			$data['ss_vhost::vhosts'] = [];
		}
		if(!isset($data['ss_vhost::vhosts'][$vhost])) {
			$data['ss_vhost::vhosts'][$vhost] = [];
		}

		$this->setArray($data);
	}

	public function removeVhost($vhost) {
		if(!$this->hasVhost($vhost)) {
			return;
		}
		$vhost = strtolower($vhost);
		$data = $this->getArray();
		unset($data['ss_vhost::vhosts'][$vhost]);

		$this->setArray($data);
	}
		
	public function hasVhost($vhost) {
		$vhost = strtolower($vhost);
		$data = $this->getArray();

		return isset($data['ss_vhost::vhosts']) && isset($data['ss_vhost::vhosts'][$vhost]);
	}

	/**
	 * @param string $vhost
	 * @param string $servername
	 * @param bool $primary - is this the new primary domain name
	 */
	public function addVhostServername($vhost, $servername, $primary) {
		$vhost = strtolower($vhost);
		if(!$this->hasVhost($vhost)) {
			return;
		}
		$data = $this->getArray();
		if(!isset($data['ss_vhost::vhosts'][$vhost]['server_names'])) {
			$data['ss_vhost::vhosts'][$vhost]['server_names'] = [];
		}

		$changed = false;
		// already set
		if(!in_array($servername, $this->getVhostServernames($vhost))) {
			$data['ss_vhost::vhosts'][$vhost]['server_names'][] = $servername;
			$changed = true;
		}

		if($primary) {
			if(!isset($data['ss_vhost::vhosts'][$vhost]['customisations'])) {
				$data['ss_vhost::vhosts'][$vhost]['customisations'] = [];
			}
			if(!isset($data['ss_vhost::vhosts'][$vhost]['customisations']['mysite::vhost'])) {
				$data['ss_vhost::vhosts'][$vhost]['customisations']['mysite::vhost'] = [];
			}
			$data['ss_vhost::vhosts'][$vhost]['customisations']['mysite::vhost']['domainname'] = $servername;
			$changed = true;
		}

		if($changed) {
			$this->setArray($data);
		}
	}

	/**
	 * @param string $vhost
	 *
	 * @return array
	 */
	public function getVhostServernames($vhost) {
		$vhost = strtolower($vhost);
		if(!$this->hasVhost($vhost)) {
			return [];
		}
		$data = $this->getArray();
		if(!isset($data['ss_vhost::vhosts'][$vhost]['server_names'])) {
			return [];
		}
		return $data['ss_vhost::vhosts'][$vhost]['server_names'];
	}

	/**
	 * @param string $vhost
	 * @param string $servername
	 */
	public function removeVhostServername($vhost, $servername) {
		$serverNames = $this->getVhostServernames($vhost);
		if(count($serverNames) == 0) {
			return;
		}
		if(!in_array($servername, $serverNames)) {
			return;
		}
		$newList = [];
		foreach($serverNames as $value) {
			if($value == $servername) {
				continue;
			}
			$newList[] = $value;
		}
		$data = $this->getArray();

		$data['ss_vhost::vhosts'][$vhost]['server_names'] = $newList;

		if(!empty($data['ss_vhost::vhosts'][$vhost]['customisations']['mysite::vhost']['domainname'])) {
			if($data['ss_vhost::vhosts'][$vhost]['customisations']['mysite::vhost']['domainname'] == $servername) {
				unset($data['ss_vhost::vhosts'][$vhost]['customisations']['mysite::vhost']['domainname']);
			}
		}
		$this->setArray($data);
	}

	/**
	 * Data content is treated as canonical, keep the SHA up to date
	 * so it can be found later.
	 */
	public function onBeforeWrite() {
		parent::onBeforeWrite();
		$this->SHA = sha1($this->Data);
	}

}
