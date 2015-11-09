var Variables = require('./variables.jsx');
var Tools = require('./tools.jsx');

var holder = document.getElementById('environmentconfig-variables-holder');
if (holder) {
	var data = Tools.readInlineData('environmentconfig-variables-model');
	React.render(
		<Variables
			initialData={data}
			context={environmentConfigContext} />,
		holder
	);
}
