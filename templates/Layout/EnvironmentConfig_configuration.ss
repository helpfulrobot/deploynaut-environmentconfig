
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

	<p>
		Configure your environment-specific variables here. For the variables to be available to your site code,
		a full deployment needs to be made. You will then be able to access them as PHP constants, just like you
		would <a href="https://docs.silverstripe.org/en/3.1/getting_started/environment_management/">other SilverStripe
		constants</a>.
	</p>

	<div class="variables" id="environmentconfig-variables-holder"></div>

	<script id="environmentconfig-variables-model" type="application/json">
		$Variables
	</script>

	<script id="environmentconfig-variables-blacklist" type="application/json">
		$Blacklist
	</script>

	<script>
		var environmentConfigContext = {
			projectUrl: "{$absoluteBaseURL}naut/api/$CurrentProject.Name",
			envUrl: "{$absoluteBaseURL}{$CurrentEnvironment.Link}",
			envName: "{$CurrentEnvironment.Name}",
			siteUrl: "{$CurrentEnvironment.URL}",
			<% if $PlatformSpecificStrings %>
				<% loop $PlatformSpecificStrings %>
					$Code: "$String",
				<% end_loop %>
			<% end_if %>
		};
	</script>
</div>

