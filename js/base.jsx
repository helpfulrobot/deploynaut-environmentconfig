var Variables = require('./variables.jsx');
var Tools = require('./tools.jsx');

var data = Tools.readInlineData('environmentconfig-variables-model');

React.render(
	<Variables
		model={data}
		context={environmentConfigContext} />,
	document.getElementById('environmentconfig-variables-holder')
);
