var _ = require('underscore');
var VariableTable = require('./variable_table.jsx');
var VariableEditor = require('./variable_editor.jsx');

var Variables = React.createClass({

	getInitialState: function() {
		// Convert the assoc data to flat array.
		var self = this;
		var dataArray = _.map(_.keys(this.props.model), function(key) {
			return {
				variable: key,
				value: self.props.model[key]
			};
		});

		return {
			editing: false,
			model: dataArray
		};
	},

	deepCopyModel: function(from) {
		var to = [];
		for (var i=0; i<from.length; i++) {
			if (!from[i].deleted) {
				to[i] = {
					variable: from[i].variable,
					value: from[i].value
				}
			}
		}

		return to;
	},

	startEditing: function() {
		this.setState({
			editing: true
		});
	},

	editingSuccessful: function(newState) {
		this.setState({
			editing: false,
			model: this.deepCopyModel(newState)
		});
	},

	editingCancelled: function() {
		this.setState({
			editing: false
		});
	},

	render: function() {
		if (!this.state.editing) {
			return (
				<VariableTable
					context={this.props.context}
					model={this.state.model}
					startEditing={this.startEditing}
					/>
			);
		} else {
			return (
				<VariableEditor
					context={this.props.context}
					model={this.deepCopyModel(this.state.model)}
					editingSuccessful={this.editingSuccessful}
					editingCancelled={this.editingCancelled}
					/>
			);
		}
	}
});


module.exports = Variables;
