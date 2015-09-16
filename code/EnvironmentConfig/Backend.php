<?php

namespace EnvironmentConfig;

interface Backend {

	public function setVariables($array);

	public function getVariables($sha = null);

	public function diffVariables($shaFrom, $shaTo = null);

	public function getYaml($sha = null);

	public function getLatestSha();

}
