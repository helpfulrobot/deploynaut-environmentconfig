<?php

namespace EnvironmentVariables;

interface Backend {

	public function __construct($environment);

	public function newVersion($array);

	public function getRaw($sha = null);

	public function getArray($sha = null);

	public function getLatestSha();

	public function diff($versionFrom, $versionTo = null);

}
