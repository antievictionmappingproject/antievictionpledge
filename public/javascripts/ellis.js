/**
 * Created with JetBrains RubyMine.
 * User: smagee
 * Date: 3/11/14
 * Time: 2:15 PM
 * To change this template use File | Settings | File Templates.
 */
var map;
var marker;
var infoWindow;

$(document).ready(function() {
    //initialize map
//    var mapOptions = {
//        center: new google.maps.LatLng(37.760, -122.435),
//        zoom: 12,
//        mapTypeId: google.maps.MapTypeId.ROADMAP
//    };
//    var x = document.getElementById("mapper");
    map = L.map("mapper").setView([37.760, -122.435], 12);
    L.tileLayer('http://{s}.tile.cloudmade.com/1a1b06b230af4efdbb989ea99e9841af/59870/256/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
    }).addTo(map);
    //initialize event handlers
    $('#find_btn').click(function() {
        findAndZoom();
    });

    $('#address').keydown(function (e){
        if(e.keyCode == 13){
            findAndZoom();
        }
    });

    $('#pet_link').click(function(){
        $('#petition').hide(100);
        $('#feedback').show(100);
    });

    $('#tw_btn').click(function() {
        window.open("https://twitter.com/intent/tweet?text=I+Pledged+not+to+rent+or+buy+Ellis-Acted+buildings.+You+can+too&url=http://www.antievictionmappingproject.net/ellis.html&via=antievictionmap", '1369959514879','width=700,height=500,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0');
    });
});

function findAndZoom() {
    var address = $("#address")[0].value;
    $.ajax({
        url: "http://nominatim.openstreetmap.org/search?q="+address+",+san+francisco,+ca&format=json",
        type: 'GET',
        success: function(results) {
            var pt = [results[0].lat, results[0].lon];
            map.setView(pt, 16);
            marker = L.marker(pt).addTo(map);
        },
        failure:function() {
            alert("Geocode was not successful");
        }
    });
//    geocoder.geocode( { 'address': address, 'componentRestrictions':{'locality': 'San+Francisco'}}, function(results, status) {
//        if (status == google.maps.GeocoderStatus.OK) {
//            map.setCenter(results[0].geometry.location);
//            map.setZoom(16);
//            if (marker) {
//                marker.setMap(null);
//            }
//            marker = new google.maps.Marker({
//                map: map,
//                position: results[0].geometry.location
//            });
//        } else {
//            alert("Geocode was not successful for the following reason: " + status);
//        }
//    });

    fetchEllisInfo(address, function(result) {
        openInfoWindow(result);
    });
}

//this has fake delay. We'll need to manage callback order, when we've got everything together. 
function fetchEllisInfo(address, callback) {
    setTimeout(function() {
        var result;
        if (address.toUpperCase() == "558 CAPP") {
            result = JSON.stringify({address: address, evictions:[{date: "1/10/2013", units: 2, landlord: 'Evil Landlords, LLC', protectedTenants: 0}]});
        } else  if (address.toUpperCase() == "132 HANCOCK") {
            result = JSON.stringify({address: address, evictions:[{date: "1/10/2013", units: 2, landlord: 'Evil Landlords, LLC', protectedTenants: 0},
                {date: "12/14/2011", units: 2, landlord: 'Flippers, Inc.', protectedTenants: 1}]});
        }  else {
            result = JSON.stringify({address: address, evictions:[]});
        }
        callback.call(this, result);
    }, 2000);
}

function openInfoWindow(result) {
    var obj = JSON.parse(result);
    var text;
    if (obj.evictions.length > 0) {
        text = "<div class='info_window'><p class='info_address'>"+ obj.address.toUpperCase()+"</p><hr/><p>Ellis Act Eviction(s) at this Address:</p>";
        text += '<table><tr><th>Date:</th><th>Landlord Name:</th><th>Units</th><th>Protected Tenants:</th></tr>';
        for (var i = 0; i < obj.evictions.length; i++) {
            var ev = obj.evictions[i];
            text += "<tr><td>"+ev.date + "</td><td>" + ev.landlord
                + "</td><td>" + ev.units + "</td><td>" + ev.protectedTenants + "</td></tr>";
        }
        text += "</table></div>";
    } else {
        text = "<div class='info_window'><p class='info_address'>"+ obj.address.toUpperCase()+"</p><hr/><p>No Ellis Act Evictions on record for this address</p></div>";
    }
//    infoWindow = new google.maps.InfoWindow({
//        content: text
//    });

    marker.bindPopup(text, {maxWidth:500}).openPopup();
}