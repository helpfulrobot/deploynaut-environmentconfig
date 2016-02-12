var Tools = require('./tools.jsx');
var trim = require('underscore.string/trim');
var _ = require('underscore');

/**
 * VariableEditor allows editing variable => value pairs, with an inline "add" and "remove"
 * capability. Variables need to be kept unique.
 */
var VariableEditor = React.createClass({
	getInitialState: function() {

		var model = Tools.deepCopyModel(this.props.model);

		// Add additional state needed for editing.
		for (var i=0; i<model.length; i++) {
			model[i].error = "";
			model[i].vacant = false;
			model[i].deleted = false;
		}

		model.push({
			variable: "",
			value: "",
			error: "",
			vacant: true,
			deleted: false
		});

		return {
			saving: false,
			model: model,
			valid: true,
			message: ""
		};
	},

	save: function(event) {
		event.stopPropagation();
		event.preventDefault();

		this.setState({
			saving: true,
			message: ""
		});

		// Deep copying also filters the model.
		var newModel = Tools.deepCopyModel(this.state.model);

		// Convert the data back into associative array expected by the backend.
		var assocArray = {};
		for (var i=0; i<newModel.length; i++) {
			if (!newModel[i].deleted) {
				assocArray[newModel[i].variable] = newModel[i].value;
			}
		}

		var self = this;
		Q($.ajax({
			type: "POST",
			url: this.props.context.envUrl + '/configuration/save',
			data: {
				Details: JSON.stringify(assocArray),
				SecurityID: this.props.securityId
			}
		}))
			.then(function(data) {
				self.props.editingSuccessful(data);
			}, function(data){
				self.setState({
					saving: false,
					message: "Failed to save changes: " + data.responseText
				});
			});
	},

	/**
	 * Main model is represented by an array, kept in the state. Wrap rows in a proxy object
	 * so that we can manipulate on them as if they were individual items.
	 *
	 * @param int row Row index in the model array. If the index is past the end of the array, it's treated
	 *	as a new item that can be added into the model.
	 */
	rowStateProxy: function(row) {
		var self = this;

		var updateState = function() {
			self.setState({model: self.state.model});
		};

		var isVariableUnique = function(variable) {
			for (var i=0; i<self.state.model.length; i++) {
				if (row!=i
					&& !self.state.model[i].deleted
					&& !self.state.model[i].vacant
					&& self.state.model[i].variable===variable
				) return false;
			}
			return true;
		};

		return ({
			isVacant: function() {
				return (typeof self.state.model[row].vacant!=='undefined' && self.state.model[row].vacant);
			},
			setVariable: function(variable) {
				if (self.state.model[row].vacant) {
					self.state.model.push({
						variable: "",
						value: "",
						vacant: true
					});
				}

				self.state.model[row].variable = variable;
				self.state.model[row].vacant = false;
				updateState();
			},
			setValue: function(value) {
				self.state.model[row].value = value;
				updateState();
			},
			remove: function() {
				self.state.model[row].deleted = true;
				updateState();
			},
			validateVariable: function(value) {
				var message = "";
				if (trim(value)==="") {
					message = "Variable cannot be empty.";
				}
				if (value.match(/[^a-zA-Z_0-9]/)) {
					message = "Only alphanumerics and underscore permitted.";
				}
				if (value.match(/^[0-9]/)) {
					message = "Variable cannot start with a digit.";
				}
				if (!isVariableUnique(value)) {
					message =  "Variable already exists.";
				}
				if (self.props.blacklist) {
					for (var i=0; i<self.props.blacklist.length; i++) {
						var re = new RegExp(self.props.blacklist[i]);
						if (value.match(re)) {
							message = "Variable is not allowed.";
							break;
						}
					}
				}

				self.state.model[row].error = message ? true : false;
				updateState();

				return message;
			}
		});
	},

	isFormValid: function() {
		for (var i=0; i<this.state.model.length; i++) {
			if (!this.state.model[i].vacant
					&& !this.state.model[i].deleted
					&& this.state.model[i].error) return false;
		}

		return true;
	},

	render: function() {
		var formValid = this.isFormValid();

		var self = this;
		var i = 0;
		var rows = _.map(this.state.model, function(item) {
			var row;
			if (!item.deleted) {
				// Rely on the positional number of the model row as the key. As rows are deleted,
				// the variables will get marked up with "deleted: true", but remain in the model
				// to ensure react knows what rows to changed.
				row = (
					<VariableEditorRow
						key={i}
						disabled={self.state.saving}
						variable={item.variable}
						value={item.value}
						rowState={self.rowStateProxy(i)} />
				);
			}
			i++;
			return row;
		});

		var message = null;
		if (this.state.message) {
			message = (
				<div className="alert alert-danger">{this.state.message}</div>
			)
		}

		return (
			<form className="variable-editor" onSubmit={this.save} >
				<VariableEditorActions
					context={this.props.context}
					disabled={!formValid}
					saving={this.state.saving}
					cancel={this.props.editingCancelled} />
				{message}
				<table className="table table-striped">
					<thead>
						<tr>
							<th className="variable">Variable <small>(string)</small></th>
							<th className="value">Value <small>(string)</small></th>
							<th className="actions">&nbsp;</th></tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
			</form>
		);
	}
});

var VariableEditorActions = React.createClass({
	render: function() {
		var buttonText = "";
		if (this.props.saving) {
			buttonText = "Saving..."
		} else {
			buttonText = "Save";
		}

		return (
			<div className="variables-actions variable-editor-actions">
				<input type="submit" disabled={this.props.disabled || this.props.saving} className="btn btn-primary" value={buttonText} />
				<button type="button" className="btn btn-default" disabled={this.props.disabled || this.props.saving} onClick={this.props.cancel}>Cancel</button>
			</div>
		);
	}
});

var VariableEditorRow = React.createClass({

	handleVariableChange: function(event) {
		this.props.rowState.setVariable(event.target.value);
	},

	handleValueChange: function(event) {
		this.props.rowState.setValue(event.target.value);
	},

	render: function() {
		var remove = null;
		if (!this.props.rowState.isVacant() && !this.props.disabled) {
			remove = (
					<button type="button" className="btn btn-danger btn-xs" onClick={this.props.rowState.remove} disabled={this.props.disabled}>
						<span className="fa fa-times" aria-hidden="true"></span>
					</button>
			);
		}
		return (
			<tr>
				<td className="variable">
					<ValidatableInput disabled={this.props.disabled} type="text" value={this.props.variable} onChange={this.handleVariableChange}
						onValidate={this.props.rowState.validateVariable} />
				</td>
				<td className="value">
					<input disabled={this.props.disabled} className='form-control' type="text" value={this.props.value}
						onChange={this.handleValueChange} />
				</td>
				<td className="actions">
					{remove}
				</td>
			</tr>
		);
	}
});

/**
 * Input field with an ability to show an error message. Pass validate, onValidationFail and onValidationSuccess
 * callbacks to handle the error messaging.
 */
var ValidatableInput = React.createClass({
	getInitialState: function() {
		return {
			message: ""
		};
	},

	handleChange: function(event) {
		var message = this.props.onValidate(event.target.value);
		this.setState({message: message});
		if (this.props.onChange) this.props.onChange(event);
	},

	render: function() {
		var className = 'form-control';
		var alert = null;
		if (this.state.message) {
			alert = <div className='validation-message'>{this.state.message}</div>;
			className += ' validation-error';
		}
		return (
			<div className="form-group">
				<input disabled={this.props.disabled} className={className} type={this.props.type}
					onChange={this.handleChange} value={this.props.value} />
				{alert}
			</div>
		);
	}
});

module.exports = VariableEditor;
