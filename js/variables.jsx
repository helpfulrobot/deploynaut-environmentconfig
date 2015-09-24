var _ = require('underscore');
var VariableTable = require('./variable_table.jsx');
var VariableEditor = require('./variable_editor.jsx');

/**
 * Variables provides a UI for displaying and editing environment variables. The main state is held here,
 * and displayed via VariableTable. Data is copied into the VariableEditor for editing, and copied back
 * if VariableEditor's save is successful.
 */
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

	startEditing: function() {
		this.setState({
			editing: true
		});
	},

	editingSuccessful: function(newModel) {
		this.setState({
			editing: false,
			model: newModel
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
					blacklist={this.props.blacklist}
					model={this.state.model}
					editingSuccessful={this.editingSuccessful}
					editingCancelled={this.editingCancelled}
					/>
			);
		}
	}
});


module.exports = Variables;
