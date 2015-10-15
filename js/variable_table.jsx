var _ = require('underscore');

/**
 * VariableTable displays variable => value pairs in a table. It also provides a button
 * to transition to the editing stage.
 */
var VariableTable = React.createClass({

	render: function() {
		var rows = _.map(this.props.model, function(item) {
			return (
				<VariableTableRow
					key={item.variable + '_' + item.value}
					variable={item.variable}
					value={item.value} />
			);
		});

		return (
			<div>
				{this.props.message}
				<div className="variables-actions variable-table-actions">
					<button type="button" className="btn btn-primary" onClick={this.props.startEditing}>Edit</button>
				</div>
				<table className="variable-table table table-striped">
					<thead>
						<tr>
							<th className="variable">Variable <small>(string)</small></th>
							<th className="value">Value <small>(string)</small></th>
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
			</div>
		);
	}
});

var VariableTableRow = React.createClass({
	render: function() {
		return (
			<tr>
				<td>{this.props.variable}</td>
				<td>{this.props.value}</td>
			</tr>
		);
	}
});

module.exports = VariableTable;
