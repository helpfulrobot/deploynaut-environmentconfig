
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

