/**
 * Created with JetBrains RubyMine.
  User: smagee
 * Date: 3/11/14
 * Time: 2:15 PM
 * To change this template use File | Settings | File Templates.
 */
var map;
var marker;
var endpoint = "displacement-server-env-rtmfzur43y.elasticbeanstalk.com";
var currentPledge = 0;
var totalPledges = 0;
var numColumns = 3;
var timeoutHook;

var evictionTypeHash = {
    "Owner Move In" : '<a href="http://www.sftu.org/omi.html" target="_blank">Owner Move-In</a>',
    "Ellis Act WithDrawal" : '<a href="http://www.sftu.org/ellis.html" target="_blank">Ellis Act</a>',
    "Non Payment": 'Non Payment',
    "Breach": 'Breach',
    "Nuisance": 'Nuisance',
    "Illegal Use": 'Illegal Use',
    "Failure to Sign Renewal": 'Failure to Sign Renewal',
    "Access Denial": 'Access Denial',
    "Unapproved Subtenant": 'Unapproved Subtenant',
    "Demolition": 'Demolition',
    "Capital Improvement": 'Capital Improvement',
    "Substantial Rehab": 'Substantial Rehab',
    "Condo Conversion": 'Condo Conversion',
    "Roommate Same Unit": 'Roommate Same Unit',
    "Other Cause": 'Other Cause',
    "Late Payments": 'Late Payments',
    "Lead Remediation": 'Lead Remediation',
    "Development": 'Development',
    "Good Samaritan Ends": 'Good Samaritan Ends'
};

$(document).ready(function() {
    map = L.map("mapper").setView([37.760, -122.435], 12);
    L.tileLayer('http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution:  'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
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
        $('#petition').fadeOut(600, function () {
            $('#feedback').fadeIn(800)
        });
    });

    $('#tw_btn').click(function() {
        window.open("https://twitter.com/intent/tweet?text=I%20took%20a%20stand%20for%20SF%20%26%20pledged%20not%20to%20rent%20or%20buy%20units%20made%20available%20by%20eviction.%20Join%20me%3A&url=http://pledge.antievictionmappingproject.net/&via=antievictionmap", '1369959514879','width=700,height=500,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0');
    });

    $('#fb_btn').click(function() {
        window.open("http://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fwww.antievictionmappingproject.net%2Fpledge%2F", '1369959514870','width=700,height=500,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0');
    });

    $('#searchPledgelink').click(function() {
        scrollTo($('#searchPledge'), 250);
        return false;
    });

    $('.CTA').click(function() {
        scrollTo($('#searchPledge'), 250);
        return false;
    });

    $('#pledgeslink').click(function(){
        scrollTo($('#pledge_total'), 350);
        return false;
    });

    $('#learnMorelink').click(function(){
        scrollTo($('.resources'), 450); //why will scrolling to learnMore not work?
        return false;
    });

    $("#logo").click(function(){
    // window.open("../update.html");
       $("html, body").animate({ scrollTop:  0}, 300);
    });

    $('#more_btn').click(function(){
        currentPledge += (numColumns * 10);
        retrievePledges();
    });
    $('#back_btn').click(function(){
        currentPledge -= (numColumns * 10);
        if (currentPledge < 0) {
            currentPledge = 0;
        }
        retrievePledges();
    });
    numColumns = $('.pledgeColumn:visible').length;
    retrievePledges();

    loadFromQuery();
});

function loadFromQuery() {
   function getAddressParameter() {
        var address = window.location.search.split("?address=")[1];
        return address && decodeURIComponent(address.replace(/\+/g, ' '));
    };
    var addressParameter = getAddressParameter();

    if (addressParameter) {
        $("#address").val(addressParameter);
        findAndZoom(true);
        scrollTo($('#searchPledge'), 10);
    };
};

$(window).bind('popstate', function() {
    loadFromQuery();
 });

$(window).resize(function(){
    var tempColumns = $('.hideMobile:visible').length > 0 ? 3 : 1;
    if (tempColumns != numColumns) {
        if (timeoutHook != null) {
            clearTimeout(timeoutHook);
            timeoutHook = null;
        }
        timeoutHook = setTimeout(function(){
            var tempColumns = $('.hideMobile:visible').length > 0 ? 3 : 1;
            if (tempColumns != numColumns) {
                numColumns = tempColumns;
                retrievePledges();
            }
        }, 500);
    }
});

function scrollTo(element, time) {
    if (time == null) {
        time = 500;
    }
    var tt = element.offset().top - $('#main_menu').height();
    $("html, body").animate({ scrollTop:  tt}, time);
}

function findAndZoom(onload) {
    var geocoder = new google.maps.Geocoder();
    var address = $("#address")[0].value;
    geocoder.geocode( { 'address': address, 'componentRestrictions':{'locality': 'San Francisco'}}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK && results[0].types.indexOf("street_address") >= 0) {
            var pt = [results[0].geometry.location.lat() , results[0].geometry.location.lng()];
            //adjust view so big info does not overlap search bar
            var pt2   = [results[0].geometry.location.lat() +.002, results[0].geometry.location.lng()];
            map.setView(pt2, 16);
            marker = L.marker(pt).addTo(map);
            var add = results[0].address_components;
            var reqStr ="num="+ encodeURI(add[0].short_name)+"&st="+encodeURI(add[1].short_name);
            var addressTxt = add[0].short_name + " " + add[1].short_name;
            fetchEllisInfo(reqStr, addressTxt, function(result) {
                openInfoWindow(result, addressTxt);
            });
            $('#instructions').hide();
            if (!onload) {
                window.history.pushState(null,'','?address=' + encodeURI(addressTxt))
            }
        } else {
            $('#instructions').text("Address not found within San Francisco. Please check the spelling and try again.").show();
        }
    });
}

function fetchEllisInfo(addressQuery, addressTxt, callback) {
    $.ajax({
        url: "http://"+endpoint+"/properties?"+addressQuery,
        type: 'GET',
        success: function(result) {
            callback(result, addressTxt);
        },
        error: function(result) {
            var popupText = '<div class="leaflet-popup-content">' +
                '<div class="info_window">' +
                  '<div class="info_address without_dd">' + addressTxt + '</div>' +
                       '<div class="info_table" style="height: 6.5em">' +
                       'No information available about this address' +
                       '</div>' +
                       submitMoreDataDiv(addressTxt) +
                       '</div></div>'
            marker.bindPopup(popupText, {maxWidth:500}).openPopup();
        }
    });
}

function submitMoreDataDiv(addressTxt) {
    return "<div class='contact_noeviction'>Know of an eviction or buyout that should be listed here? <a href='mailto:aemppledge@gmail.com?subject=" + encodeURIComponent(addressTxt) + "' target='_blank'>Let us know</a></div>";
}

function submitPledge() {
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
            retrievePledges();
        }
    });
}

function getTotal(evictions){
    let result = [];
    for (let i = 0; i < evictions.length; i++) {
        if (result.indexOf(evictions[i].petition + evictions[i].date) == -1) {
            result.push(evictions[i].petition + evictions[i].date);
        }
    }
    return result.length;
}

function openInfoWindow(result, addressTxt) {
    var obj = result;
    var text;
    var total;
    total = getTotal(obj.evictions);
    if (obj.evictions && obj.evictions.length > 0) {
        var subtext = "<div class='info_table'><table>";
        var units_count = 0;
        var protected = obj.hasOwnProperty("protected_tenants") ? obj.protected_tenants : 0;
        //some building have omis, some ellises, some both
        var omi = false;
        var ellis = false;
        console.log("object", obj);
        for (var i = 0; i < obj.evictions.length; i++) {
            var ev = obj.evictions[i];
            if (ev.eviction_type == "Ellis Act WithDrawal") {
                ellis = true;
            } else if (ev.eviction_type == "Owner Move In") {
                omi = true;
            }
            var d = new Date(ev.date);
            if (ev.hasOwnProperty("units") && ev.units !== null) { //  && ev.eviction_type == "Ellis Act WithDrawal"
                if (! isNaN(parseInt(ev.units))) {
                    units_count += parseInt(ev.units);
                } else {
                    units_count++;
                }
            }
            subtext += "<tr><td class='ev_date'>"+ d.toLocaleDateString() + "<br />" + evictionTypeHash[ev.eviction_type] + "</td><td class='ev_landlords'>";
            if (ev.eviction_type == "Ellis Act WithDrawal" && ev.hasOwnProperty("landlords")){
                subtext += "Landlords: " + ev.landlords[0];
                for (var j = 1; j < ev.landlords.length; j++) {
                    subtext += " &bull; " + ev.landlords[j];
                }
            } else if (ev.hasOwnProperty("apt") && ev.apt !== null) { // ev.eviction_type == "Owner Move In" && 
                // console.log("ev.units", ev.units);
                subtext += ev.apt;
            } else {
                subtext += "Detailed unit info not available";
            }
            subtext += "</td></tr></div>";
        }
        subtext += "</table></div>";
        //address needs different margins with dirty dozen tag
        var add_class = obj.dirty_dozen != null ? 'info_address with_dd' : 'info_address without_dd';
        text = "<div class='info_window'><div class='" + add_class +"'>"+ addressTxt+"</div>";
        if (obj.dirty_dozen != null) {
            text += "<div class='dirty_dozen'><p class='dd_hdr' id='dd_hdr'>A Dirty Dozen Eviction<a href='" + obj.dirty_dozen + "' id='dd_lrn' target='_blank'>Learn More</a></p></div>";
        }
        var evUnitsNum = units_count;
        text += "<div class='header_nums'>" +
                 "<div class='total_col w33'><div class='circle_num redbg'>"+ total +"</div><div class='ig_text red'>Total <br/ >Evictions</div></div>";
        text +=  "<div class='total_col w27'><div class='circle_num bluebg'>"+ evUnitsNum +"</div><div class='ig_text blue'>Affected<br />Units</div></div>";
        text +=  "<div class='total_col w40'><div class='circle_num lightbluebg'>"+ protected +"</div><div class='ig_text lightblue'>Senior or Disabled<br />Tenants Since 2008</div></div></div>";
        text += subtext;
    } else {
        text = "<div class='info_window fixed'><div class='info_address without_dd'>"+ addressTxt+"</div><div class='total_col'><div class='circle_num lightbluebg'>0</div><div class='no_evictions'>" +
            "There are no evictions at this address. Awesome!</div></div>" + submitMoreDataDiv(addressTxt) +"</div> ";
    }
    var ww = $(window).width() - 48;
    marker.bindPopup(text, {maxWidth:Math.min(500, ww)}).openPopup();
    $('#find_btn').focus();
}

function retrievePledges() {
    $.ajax({
        url: "http://"+endpoint+"/pledges?limit="+(10 * numColumns)+"&skip="+currentPledge,
        type: 'GET',
        success: function(result) {
            var rootDiv = $('<div class="pledge_columns"></div> ');
            var j = 1;
            var sel = $('<div id="pledgeColumn_'+j+'" class="pledgeColumn"></div>')
            var list = sel.append('<ul/>');
            for (var i = 0; i < result.length; i++){
                if (i > 0 && i % 10 == 0){
                    rootDiv.append(sel);
                    j++;
                    sel =  $('<div id="pledgeColumn_'+j+'" class="pledgeColumn hideMobile"></div>');
                    list = sel.append('<ul/>');
                }
                var reason = result[i].reason ? result[i].reason : "";
                var blob = '<li class="pledger"><span class="name">'+result[i].name+'</span> <span class="reason">' + reason + '</span></li>';
                list.append(blob);
            }
            rootDiv.append(sel);
            var o = $('#pledgeColumnWrapper').find('.pledge_columns');
            o.replaceWith(rootDiv);

            adjustButtons();
        }
    });

    $.ajax({
        url: "http://"+endpoint+"/pledges/total",
        type: 'GET',
        success: function(result) {
            $('#pledge_total').text(result+" people have pledged");
            adjustButtons();
            totalPledges = result;
        }
    });
}

function adjustButtons() {
    var numPerPage = numColumns * 10;
    if (currentPledge == 0) {
        $('.previous').hide();
    } else {
        $('.previous').show();
    }
    if (totalPledges > currentPledge + numPerPage) {
        $('.more').show();
    } else {
        $('.more').hide();
    }
}
