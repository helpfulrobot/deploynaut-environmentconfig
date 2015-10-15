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
			Variables: Tools.modelToArray(this.props.initialData.Variables),
			SecurityID: this.props.initialData.InitialSecurityID
		};
	},

	startEditing: function() {
		this.setState({
			editing: true,
			message: ''
		});
	},

	editingSuccessful: function(data) {
		this.setState({
			editing: false,
			Variables: Tools.modelToArray(data.Variables),
			SecurityID: data.NewSecurityID,
			message: data.Message
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
					model={this.state.Variables}
					startEditing={this.startEditing}
					message={message}
					/>
			);
		} else {
			return (
				<VariableEditor
					context={this.props.context}
					blacklist={this.props.initialData.Blacklist}
					model={this.state.Variables}
					securityId={this.state.SecurityID}
					editingSuccessful={this.editingSuccessful}
					editingCancelled={this.editingCancelled}
					/>
			);
		}
	}
});


module.exports = Variables;
