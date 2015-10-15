var _ = require('underscore');
var VariableTable = require('./variable_table.jsx');
var VariableEditor = require('./variable_editor.jsx');
var Tools = require('./tools.jsx');

/**
 * Variables provides a UI for displaying and editing environment variables. The main state is held here,
 * and displayed via VariableTable. Data is copied into the VariableEditor for editing, and copied back
 * if VariableEditor's save is successful.
 */
var Variables = React.createClass({

	getInitialState: function() {
		return {
			editing: false,
			model: Tools.modelToArray(this.props.model)
		};
	},

	startEditing: function() {
		this.setState({
			editing: true,
			message: ''
		});
	},

	editingSuccessful: function(newModel, message) {
		this.setState({
			editing: false,
			model: newModel,
			message: message
		});
	},

	editingCancelled: function() {
		this.setState({
			editing: false
		});
	},

	render: function() {
		if (!this.state.editing) {
			var message = '';
			if (this.state.message) {
				message = (
					<div className='alert alert-success' dangerouslySetInnerHTML={{__html:this.state.message}} />
				);
			}

			return (
				<VariableTable
					context={this.props.context}
					model={this.state.model}
					startEditing={this.startEditing}
					message={message}
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
