var Variables = require('./variables.jsx');
var Tools = require('./tools.jsx');

var data = Tools.readInlineData('environmentconfig-variables-model');

var holder = document.getElementById('environmentconfig-variables-holder');
if (holder) {
	React.render(
		<Variables
			initialData={data}
			context={environmentConfigContext} />,
		holder
	);
}
