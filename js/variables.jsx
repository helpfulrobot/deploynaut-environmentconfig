var _ = require('underscore');
var VariableTable = require('./variable_table.jsx');
var VariableEditor = require('./variable_editor.jsx');

/**
 * Variables provides a UI for displaying and editing environment variables. The main state is held here,
 * and displayed via VariableTable. Data is copied into the VariableEditor for editing, and copied back
 * if VariableEditor's save is successful.
 */
var Variables = React.createClass({

	modelToArray: function(model) {
		return _.map(_.keys(model), function(key) {
			return {
				variable: key,
				value: model[key]
			};
		});
	},

	getInitialState: function() {
		return {
			editing: false,
			Variables: this.modelToArray(this.props.model.Variables),
			SecurityID: this.props.model.InitialSecurityID
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
			Variables: this.modelToArray(data.Variables),
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
					<div className="variables">
						<div className='alert alert-success' dangerouslySetInnerHTML={{__html:this.state.message}} />
					</div>
				);
			}

			return (
				<div className="variables">
				<VariableTable
					context={this.props.context}
					model={this.state.Variables}
					startEditing={this.startEditing}
					message={message}
					/>
				</div>
			);
		} else {
			return (
				<div className="variables">
				<VariableEditor
					FormAction={this.props.model.FormAction}
					blacklist={this.props.model.Blacklist}
					model={this.state.Variables}
					securityId={this.state.SecurityID}
					editingSuccessful={this.editingSuccessful}
					editingCancelled={this.editingCancelled}
					/>
				</div>
			);
		}
	}
});


module.exports = Variables;
