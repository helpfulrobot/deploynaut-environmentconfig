
<div class="content page-header">
	<div class="row">
		<div class="col-md-12">
			<% include Breadcrumb %>
			<% include DeploymentTabs %>
			<% include ProjectLinks %>
		</div>
	</div>
</div>

<div class="content">

	<h3>Environment variables</h3>

	<div class="variables-description">
		<p>
			Configure your environment-specific variables here. You will be able to access them as PHP constants,
			just like you would <a href="https://docs.silverstripe.org/en/getting_started/environment_management/">
			other SilverStripe constants</a>. All variables and values are parsed as strings.
		</p>

		<p>
			After making changes to these variables, please perform a deployment to make them available on your site.
		</p>
	</div>

	$getReactComponent(Variables)

	<div class="variables-description small"><p><i>
		Note: These environment values will be readable by
		<% if $AllowedToRead %><% loop $AllowedToRead %>$Name, <% end_loop %><% end_if %>
		SilverStripe Ops, and the servers in the $Environment.Name environment. They are stored in plaintext on the
		Platform Dashboard server.
	</i></p></div>

</div>

