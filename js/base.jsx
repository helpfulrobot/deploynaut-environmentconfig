var Variables = require('./variables.jsx');
var Tools = require('./tools.jsx');

var data = Tools.readInlineData('environmentconfig-variables-model');
var blacklist = Tools.readInlineData('environmentconfig-variables-blacklist');

React.render(
	<Variables
		model={data}
		blacklist={blacklist}
		context={environmentConfigContext} />,
	document.getElementById('environmentconfig-variables-holder')
);
