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
var endpoint = "displacement-server-env-rtmfzur43y.elasticbeanstalk.com";

$(document).ready(function() {
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
        submitPledge();
        $('#petition').hide(100);
        $('#feedback').show(100);
    });

    $('#tw_btn').click(function() {
        window.open("https://twitter.com/intent/tweet?text=I+Pledged+not+to+rent+or+buy+Ellis-Acted+buildings.+You+can+too&url=http://www.antievictionmappingproject.net/ellis.html&via=antievictionmap", '1369959514879','width=700,height=500,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0');
    });


    $('#searchPledgelink').click(function() {
        scrollTo($('#searchPledge'), 250);
        return false;
    });

    $('#pledgeslink').click(function(){
        scrollTo($('#pledges'), 350);
        return false;
    });

    $('#learnMorelink').click(function(){
        scrollTo($('.resources'), 450); //why will scrolling to learnMore not work?
        return false;
    });

    $("#logo").click(function(){
        $("html, body").animate({ scrollTop:  0}, 300);
    });

    retrievePledges();
});

function scrollTo(element, time) {
    if (time == null) {
        time = 500;
    }
    var tt = element.offset().top - $('#main_menu').height();
    $("html, body").animate({ scrollTop:  tt}, time);
}

function findAndZoom() {
    var geocoder = new google.maps.Geocoder();
    var address = $("#address")[0].value;
    geocoder.geocode( { 'address': address, 'componentRestrictions':{'locality': 'San+Francisco'}}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var pt = [results[0].geometry.location.k, results[0].geometry.location.A];
            map.setView(pt, 16);
            marker = L.marker(pt).addTo(map);
            var add = results[0].address_components;
            var reqStr ="num="+ encodeURI(add[0].short_name)+"&st="+encodeURI(add[1].short_name);
            var addressTxt = add[0].short_name + " " + add[1].short_name;
            fetchEllisInfo(reqStr, addressTxt, function(result) {
                openInfoWindow(result, addressTxt);
            });
        } else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
}

function fetchEllisInfo(addressQuery, addressTxt, callback) {
    $.ajax({
        url: "http://"+endpoint+"/properties?"+addressQuery,
        type: 'GET',
        success: function(result) {
            callback(result, addressTxt);
        }
    });
}

function submitPledge() {
    console.log($('#pt_usable').is(':checked'));
    var data = {
        firstName: $('#pt_firstname').val(),
        lastName: $('#pt_lastname').val(),
        email: $('#pt_email').val(),
        reason: $('#pt_reason').val(),
        anonymous: !($('#pt_usable').is(':checked'))
    };
    $.ajax({
        url: "http://"+endpoint+"/pledges",
        data: data,
        type: 'POST',
        success: function(result) {
            console.log(result);
        }
    });
}

function openInfoWindow(result, addressTxt) {
    var obj = result;
    var text;
    if (obj.evictions && obj.evictions.length > 0) {
        text = "<div class='info_window'><p class='info_address'>"+ addressTxt.toUpperCase()+"</p><hr/><p>Ellis Act Eviction(s) at this Address:</p>";
        text += '<table><tr><th>Date:</th><th>Landlord Name:</th><th>Units</th><th>Protected Tenants:</th></tr>';
        for (var i = 0; i < obj.evictions.length; i++) {
            var ev = obj.evictions[i];
            var d = new Date(ev.date);
            text += "<tr><td>"+ d.toLocaleDateString() + "</td><td>" + ev.landlord
                + "</td><td>" + ev.units + "</td><td>" +"N/A" /*+ ev.protectedTenants */+ "</td></tr>";
        }
        text += "</table></div>";
    } else {
        text = "<div class='info_window'><p class='info_address'>"+ addressTxt.toUpperCase()+"</p><hr/><p>No Ellis Act Evictions on record for this address</p></div>";
    }
    marker.bindPopup(text, {maxWidth:500}).openPopup();
}

function retrievePledges() {
    $('.pledgeColumn').empty();

    $.ajax({
        url: "http://"+endpoint+"/pledges",
        type: 'GET',
        success: function(result) {
            var j = 0
            var sel = $('#pledgeColumn_'+j)
            var list = sel.append('<ul/>');
            for (var i = 0; i < result.length; i++){
                if (i % 10 == 0){
                    j++;
                    sel = $('#pledgeColumn_'+j);
                    list = sel.append('<ul/>');
                }
                var blob = '<li><span class="name">'+result[i].name+'</span> <span class="reason">' + result[i].reason + '</span></li>';
                list.append(blob);
            }
        }
    });
}