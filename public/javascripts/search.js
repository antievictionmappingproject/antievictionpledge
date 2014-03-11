$(function(){
	$('#address-search').on('keyup', function(e){
		if(e.keyCode === 13) {
			var parameters = { address: $(this).val() };
			$.get( 'http://' + appConfig.apiUrlBase + '/properties', parameters, function(data) {
				//TODO: error handling
				map.panTo([data.lat, data.lon]);
				map.setZoom(16);
				if (marker !== undefined) map.removeLayer(marker);
				marker = L.marker([data.lat, data.lon]).addTo(map);
				//todo: template
				var evictions = "";
				if (data.evictions !== undefined) {
					evictions = 'Evictions: ' + data.evictions.join(', <br/>') 
				} 
				marker.bindPopup('<b>'+ data.addresses.join(", <br/>") + '</b></br>' + evictions).openPopup();
				var markerGroup = L.layerGroup([marker]);
				console.log(data);
			});
		};
	});
});