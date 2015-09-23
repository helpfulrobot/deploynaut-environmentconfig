
module.exports = {
	/**
	 * Parses html-encoded JSON data from a application/json script tag.
	 */
	readInlineData: function readInlineData(id) {
		var dataElement = document.getElementById(id);
		var dataText = dataElement.textContent || dataElement.innerText;
		var decodeElement = document.createElement("textarea");
		decodeElement.innerHTML = dataText;
		return JSON.parse(decodeElement.value);
	},

	/**
	 * Copy just what's needed into a new instance of the model.
	 */
	deepCopyModel: function(from) {
		var to = [];
		for (var i=0; i<from.length; i++) {
			if (!from[i].deleted && !from[i].vacant) {
				to[i] = {
					variable: from[i].variable,
					value: from[i].value
				}
			}
		}

		return to;
	}
}

