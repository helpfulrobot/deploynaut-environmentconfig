<?php

namespace EnvironmentConfig;

class ConfigTest extends \SapphireTest {

	public function testContentIsEmptyBeforeWrite() {
		$obj = new Config();
		$this->assertEquals('', $obj->getYaml(null));
		$this->assertEquals('', $obj->getLatestSha());
	}

	public function testShaIsSetAfterWrite() {
		$obj = new Config();
		$data = ['key'=>'value'];
		$expectedSha = 'e064b9acffb0c74899b6741a4e994ff27c467f3c';
		$obj->setArray($data);
		$obj->write();
		$this->assertEquals($expectedSha, $obj->getLatestSha());
		$t = $obj->getArray($expectedSha);
		$this->assertEquals($data, $t);
	}

	public function testDiffVariables() {
		$obj = new Config();
		$obj->setVariables(['blork'=>'value1']);
		$firstSha = $obj->getLatestSha();
		$obj->setVariables(['blork'=>'value2']);
		$this->assertEquals(['changed' => ['blork']], $obj->diffVariables($firstSha, $obj->getLatestSha()));
	}

	public function testDiffVariablesWithVhost() {
		$this->markTestSkipped('This functionality hasn\'t been implemented, yet..');
		$vhost = 'myhost';
		$obj = new Config();

		$obj->setVariables(['blork'=>'value1'], $vhost);
		$firstSha = $obj->getLatestSha();
		$obj->setVariables(['blork'=>'value2'], $vhost);
		$secondSha = $obj->getLatestSha();

		$this->assertNotEquals([], $obj->diffVariables($firstSha, $secondSha, $vhost));
	}

	public function testAddRemoveVhost() {
		$vhost = 'myhost';
		$obj = new Config();
		$obj->addVhost($vhost);
		$this->assertTrue($obj->hasVhost($vhost));
		$this->assertFalse($obj->hasVhost('dont_exists'));
		$obj->removeVhost($vhost);
		$this->assertFalse($obj->hasVhost($vhost));
	}

}