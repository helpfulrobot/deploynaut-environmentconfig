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

	public function testGetVhostServerNamesEmptyWithAnExistingVhost() {
		$vhost = 'my_vhost';
		$obj = new Config();
		$this->assertEquals([], $obj->getVhostServernames($vhost));
	}

	public function testAddRemoveVhostServerName() {
		$myVhost = 'my_vhost';

		$first = 'first.server.com';
		$second = 'second.server.com';
		$third = 'third.server.com';

		$obj = new Config();
		$obj->addVhost($myVhost);
		$obj->addVhostServername($myVhost, $first, true);
		$obj->addVhostServername($myVhost, $second, false);
		$obj->addVhostServername($myVhost, $third, false);
		$this->assertEquals([$first, $second, $third], $obj->getVhostServernames($myVhost));

		$obj->removeVhostServername($myVhost, $second);
		$this->assertEquals([$first, $third], $obj->getVhostServernames($myVhost));

		$obj->removeVhostServername($myVhost, $first);
		$this->assertEquals([$third], $obj->getVhostServernames($myVhost));

		$obj->removeVhostServername($myVhost, $third);
		$this->assertEquals([], $obj->getVhostServernames($myVhost));
	}

	public function testGetVHostServerNameEmptyWhenNotSet() {
		$vhost = 'my_vhost';
		$obj = new Config();
		$obj->addVhost($vhost);
		$this->assertEquals([], $obj->getVhostServernames($vhost));
	}

	public function testAddVhostServerNameDoesntDuplicate() {
		$vhost = 'my_vhost';
		$vhostServername = 'my.server.com';
		$obj = new Config();
		$obj->addVhost($vhost);
		$obj->addVhostServername($vhost, $vhostServername, true);
		$obj->addVhostServername($vhost, $vhostServername, false);
		$this->assertEquals([$vhostServername], $obj->getVhostServernames($vhost));
	}

	public function testRemoveVhostServerNameOnMissingVhost() {
		$vhost = 'my_vhost';
		$vhostServername = 'my.server.com';
		$obj = new Config();
		$obj->removeVhostServername($vhost, $vhostServername);
		$this->assertEquals([], $obj->getVhostServernames($vhost));
	}

	/**
	 * This test makes sure that the internal data format for the config
	 * is correctly specified. There are some strict rules that needs to
	 * be followed
	 *
	 */
	public function testAddRemoveVhostDataStructure() {
		$myVhost = 'my_vhost';

		$first = 'first.server.com';
		$second = 'second.server.com';

		$obj = new Config();
		$obj->addVhost($myVhost);
		$obj->addVhostServername($myVhost, $first, true);
		$obj->addVhostServername($myVhost, $second, false);

		$actual = $obj->getArray();
		$expected = [
			'ss_vhost::vhosts' => [
				$myVhost => [
					'server_names' => [ $first, $second ],
					'customisations' => [
						'mysite::vhost' => [
							'domainname' => $first
						]
					]
				]
			]
		];
		$this->assertEquals($expected, $actual);

		$obj->removeVhostServername($myVhost, $first);
		$actual = $obj->getArray();
		$expected = [
			'ss_vhost::vhosts' => [
					$myVhost => [
					'server_names' => [ $second ],
					'customisations' => [
						'mysite::vhost' => []
					]
				]
			]
		];
		$this->assertEquals($expected, $actual);
	}

	public function testManualSetPrimaryDomainDontGetClobbered() {
		$myVhost = 'my_vhost';
		$first = 'first.server.com';
		$second = 'second.server.com';

		$obj = new Config();
		$obj->addVhost($myVhost);
		$obj->addVhostServername($myVhost, $first, true);
		$obj->addVhostServername($myVhost, $second, false);

		// here we do a manual override of the domain name, like someone was
		// manipulating this in the CMS
		$manualData = $obj->getArray();
		$override = 'manually_overridden.com';
		$manualData['ss_vhost::vhosts']['my_vhost']['customisations']['mysite::vhost']['domainname'] = $override;
		$obj->setArray($manualData);


		// remove the primary domain,
		$obj->removeVhostServername($myVhost, $first);

		$expected = [
			'ss_vhost::vhosts' => [
				$myVhost => [
					'server_names' => [ $second ],
					'customisations' => [
						'mysite::vhost' => [
							'domainname' => $override
						]
					]
				]
			]
		];
		$actual = $obj->getArray();

		$this->assertEquals($expected, $actual);
	}

	public function testSetVhostVariables() {
		$myVhost = 'my_vhost';
		$first = 'first.server.com';
		$obj = new Config();
		$obj->addVhost($myVhost);
		$obj->addVhostServername($myVhost, $first, true);

		$obj->setVariables(['some_key' => 'some_value'], $myVhost);

		$actual = $obj->getArray();
		$expected = [
			'ss_vhost::vhosts' => [
				$myVhost => [
					'server_names' => [
						$first
					],
					'customisations' => [
						'mysite::vhost' => [
							'domainname' => 'first.server.com',
							'user_defines' => [
								'some_key' => 'some_value'
							]
						]
					]
				]
			]
		];

		$this->assertEquals($expected, $actual);
	}

	public function testSetCustomValuesDontHaveRaceCondition() {

		$myVhost = 'my_vhost';
		$first = 'first.server.com';
		$obj = new Config();
		$obj->addVhost($myVhost);
		$obj->addVhostServername($myVhost, $first, true);

		$obj->setVariables(['some_key' => 'some_value'], $myVhost);

		$data = $obj->getArray();
		$data['ss_vhost::vhosts'][$myVhost]['customisations']['mysite::vhost']['ops_defines'] = [
				'SS_DEFAULT_ADMIN_USERNAME' => 'silverstripe',
				'SS_DEFAULT_ADMIN_PASSWORD' => 'random_password',
		];
		$obj->setArray($data);

		$actual = $obj->getArray();
		$expected = [
			'ss_vhost::vhosts' => [
				$myVhost => [
					'server_names' => [ $first ],
					'customisations' => [
						'mysite::vhost' => [
							'domainname' => 'first.server.com',
							'user_defines' => [
								'some_key' => 'some_value'
							],
							'ops_defines' => [
								'SS_DEFAULT_ADMIN_USERNAME' => 'silverstripe',
								'SS_DEFAULT_ADMIN_PASSWORD' => 'random_password'
							]
						]
					]
				]
			]
		];

		$this->assertEquals($expected, $actual);


	}

}