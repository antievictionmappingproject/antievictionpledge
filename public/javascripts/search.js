$(function(){
	$('#address-search').on('keyup', function(e){
		if(e.keyCode === 13) {
			var parameters = { address: $(this).val() };
			$.get( 'http://' + appConfig.apiUrlBase + '/properties', parameters, function(data) {
				$('#results').html(data);
			});
		};
	});
});