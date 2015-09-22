var trim = require('underscore.string/trim');
var _ = require('underscore');

/**
 * VariableEditor allows editing variable => value pairs, with an inline "add" and "remove"
 * capability. Variables need to be kept unique.
 */
var VariableEditor = React.createClass({
	getInitialState: function() {
		return {
			saving: false,
			model: this.props.model,
			valid: true,
			message: ""
		};
	},

	save: function(event) {
		event.stopPropagation();
		event.preventDefault();

		this.setState({saving: true});

		var assocArray = {};
		for (var i=0; i<this.state.model.length; i++) {
			if (!this.state.model[i].deleted) {
				assocArray[this.state.model[i].variable] = this.state.model[i].value;
			}
		}

		var self = this;
		Q($.ajax({
			type: "POST",
			url: this.props.context.envUrl + '/configuration_save',
			data: {
				variables: JSON.stringify(assocArray)
			}
		}))
			.then(function() {
				self.setState({
					saving: false,
					message: ""
				});
				self.props.editingSuccessful(self.state.model);
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

		var checkNewNeeded = function() {
			if (row>=self.state.model.length) {
				self.state.model.push({
					variable: '',
					value: ''
				});
			}
		}

		var updateState = function() {
			self.setState({model: self.state.model});
		}

		return ({
			setVariable: function(variable) {
				checkNewNeeded();
				self.state.model[row].variable = variable;
				updateState();
			},
			setValue: function(value) {
				checkNewNeeded();
				self.state.model[row].value = value;
				updateState();
			},
			// Create a new item in the model.
			add: function(variable, value) {
				checkNewNeeded();
				self.state.model[row].variable = variable;
				self.state.model[row].value = value;
				updateState();
			},
			remove: function() {
				self.state.model[row].deleted = true;
				updateState();
			},
			// Check if the variable's value is unique in the model.
			isVariableUnique: function(variable) {
				for (var i=0; i<self.state.model.length; i++) {
					if (row!=i && self.state.model[i].variable===variable) return false;
				}
				return true;
			}
		});
	},

	handleValidationFail: function() {
		this.setState({valid: false});
	},

	handleValidationSuccess: function() {
		this.setState({valid: true});
	},

	render: function() {
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
						validationFail={self.handleValidationFail}
						validationSuccess={self.handleValidationSuccess}
						rowState={self.rowStateProxy(i)} />
				);
			} else {
				<tr></tr>
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
				{message}
				<table className="table table-striped">
					<thead>
						<tr>
							<th className="variable">Variable</th>
							<th className="value">Value</th>
							<th className="actions">&nbsp;</th></tr>
					</thead>
					<tbody>
						{rows}
						<VariableEditorNew
							disabled={self.state.saving}
							rowState={self.rowStateProxy(i)} />
					</tbody>
				</table>
				<VariableEditorActions
					context={this.props.context}
					disabled={!this.state.valid}
					saving={this.state.saving}
					cancel={this.props.editingCancelled} />
			</form>
		);
	}
});

var VariableEditorActions = React.createClass({
	render: function() {
		if (!this.props.saving) {
			return (
				<div className="bottom-actions variable-editor-actions">
					<input type="submit" disabled={this.props.disabled} className="btn btn-primary" onClick={this.props.save} value="Save" />
					<button type="button" className="btn btn-default" onClick={this.props.cancel}>Cancel</button>
				</div>
			);
		} else {
			return (
				<div className="bottom-actions variable-editor-actions">
					<span>Saving...</span>
				</div>
			);
		}
	}
});

var VariableEditorRow = React.createClass({

	handleVariableChange: function(event) {
		this.props.rowState.setVariable(event.target.value);
	},

	handleValueChange: function(event) {
		this.props.rowState.setValue(event.target.value);
	},

	validateVariable: function(value) {
		if (trim(value)==="") {
			return "Variable cannot be empty.";
		}
		if (value.match(/[^A-Z_0-9]/)) {
			return "Only uppercase characters, digits and underscores permitted.";
		}
		if (!this.props.rowState.isVariableUnique(value)) {
			return "Variable already exists.";
		}
	},

	render: function() {
		return (
			<tr>
				<td>
					<ValidatableInput disabled={this.props.disabled} type="text" value={this.props.variable} onChange={this.handleVariableChange}
						validate={this.validateVariable} onValidationFail={this.props.validationFail} onValidationSuccess={this.props.validationSuccess} />
				</td>
				<td>
					<input disabled={this.props.disabled} type="text" value={this.props.value} onChange={this.handleValueChange} />
				</td>
				<td>
					<button type="button" className="btn btn-danger btn-xs" onClick={this.props.rowState.remove} disabled={this.props.disabled}>Remove</button>
				</td>
			</tr>
		);
	}
});

var VariableEditorNew = React.createClass({

	getInitialState: function() {
		return {
			variable: "",
			value: "",
			valid: false
		};
	},

	handleVariableChange: function(event) {
		this.setState({variable: event.target.value});
	},

	handleValueChange: function(event) {
		this.setState({value: event.target.value});
	},

	handleAdd: function() {
		this.props.rowState.add(this.state.variable, this.state.value);
		this.setState(this.getInitialState());
	},

	handleValidationFail: function() {
		this.setState({valid: false});
	},

	handleValidationSuccess: function() {
		this.setState({valid: true});
	},

	validateVariable: function(value) {
		if (trim(value)==="") {
			return "Variable cannot be empty.";
		}
		if (value.match(/[^A-Z_0-9]/)) {
			return "Only uppercase characters and underscores permitted.";
		}
		if (!this.props.rowState.isVariableUnique(value)) {
			return "Variable with this name already exists.";
		}
	},

	render: function() {
		return (
			<tr>
				<td>
					<ValidatableInput disabled={this.props.disabled} type="text" onChange={this.handleVariableChange} value={this.state.variable}
						validate={this.validateVariable} onValidationFail={this.handleValidationFail} onValidationSuccess={this.handleValidationSuccess} />
				</td>
				<td>
					<input disabled={this.props.disabled} type="text" onChange={this.handleValueChange} value={this.state.value} />
				</td>
				<td>
					<button disabled={this.props.disabled || !this.state.valid} type="button" className="btn btn-success btn-xs" onClick={this.handleAdd}>Add</button>
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

	update: function(value) {
		var message = this.props.validate(value);
		this.setState({message: message});
		if (!message) {
			this.props.onValidationSuccess();
		} else {
			this.props.onValidationFail();
		}
	},

	handleChange: function(event) {
		this.update(event.target.value);
		if (this.props.onChange) {
			this.props.onChange(event);
		}
	},

	handleBlur: function(event) {
		this.update(event.target.value);
		if (this.props.onBlur) {
			this.props.onBlur(event)
		}
	},

	render: function() {
		return (
			<div>
				<input disabled={this.props.disabled} type={this.props.type} onChange={this.handleChange}
					onBlur={this.handleBlur} value={this.props.value} defaultValue={this.props.defaultValue} />
				<small className="error">{this.state.message}</small>
			</div>
		);
	}
});

module.exports = VariableEditor;
