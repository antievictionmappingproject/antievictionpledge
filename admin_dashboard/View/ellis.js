$(function () {
    if ($.session.get("myLoginKey") !== 'fdb5dfb15fdb85fd5bdf845b5fdb8fd5bfd84b5dfb854fbdf8b52dfb8df45b') {
        window.location.href = window.location.origin + "/pledge/admin_dashboard/";
    }
});

$('#logout').click(function () {
    $(function () {
        $.session.set("myLoginKey", "0");
        window.location.href = window.location.origin + "/pledge/admin_dashboard/";
    });

})
endpoint = "displacementmap-server-prod.us-west-1.elasticbeanstalk.com";

function change_status(elem) {

    var id = elem.getAttribute('attrid');
    var status = elem.getAttribute('attrstatus')

    $.ajax({
        url: "http://" + endpoint + "/pledges/status",
        type: 'GET',
        data: {id: id, status: status},
        success: function (result) {
            elem.setAttribute('attrstatus', result);
        }
    });
}

function deletePledges(id) {
    var conf = confirm('Are you sure you want to delete?');
    if (conf == true) {
        // alert(5)
        $.ajax({
            url: "http://" + endpoint + "/pledges/delete",
            type: 'GET',
            data: {id: id},
            success: function (result) {
                if (result == 'ok') {
                    location.reload();

                }
            }
        });
    }
}

function updatePledges(id) {
    $.ajax({
        url: "http://" + endpoint + "/pledges/update_data",
        type: 'POST',
        data: {id: id},
        success: function (result) {
            if (result[0]['email'].length > 2) {
                $('#up_name').val(result[0]['name'])
                $('#up_lname').val(result[0]['lname'])
                $('#up_email').val(result[0]['email'])
                $('#up_reason').val(result[0]['reason'])
                $('#save_updated').attr('carent_item_id', result[0]['id'])
                $('#up_modal').css('display', 'block');
            }
        }
    });
}


$(document).ready(function () {
    var endpoint = "displacementmap-server-prod.us-west-1.elasticbeanstalk.com";
    var numColumns = 3;
    var currentPledge = 0;
    var totalPledges = 0;

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

    $('#more_btn').click(function () {
        currentPledge += (numColumns * 10);
        retrievePledges();
    });
    $('#back_btn').click(function () {
        currentPledge -= (numColumns * 10);
        if (currentPledge < 0) {
            currentPledge = 0;
        }
        retrievePledges();
    });

    $('#clear').click(function(){
        retrievePledges();
        $(this).css('display','none')
        $('.previous').css('display', 'block');
        $('.more').css('display', 'block');
    })

    function retrievePledges() {
        $.ajax({
            url: "http://" + endpoint + "/pledges_ad?limit=" + (10 * numColumns) + "&skip=" + currentPledge,
            type: 'GET',
            success: function (result) {
                $('#coment_table').html('');
                // console.log(result);
                var elem = $('#coment_table');
                var content = '';
                var id = 0;
                var stat = 0;
                for (var i = 0; i < result.length; i++){
                    id = result[i].id;
                    stat = result[i].status;
                    var check = '';
                    if (result[i].status == 1) {
                        check = 'checked';
                    }
                    content += '<tr>';
                    content += '<td style="color: #fff;">' + result[i].name + '</td>';
                    content += '<td style="color: #fff;">' + result[i].lname + '</td>';
                    content += '<td style="color: #fff;">' + result[i].email + '</td>';
                    content += '<td style="color: #fff;">' + result[i].reason + '</td>';
                    content += '<td style="color: #fff;">' + result[i].timestamp + '</td>';
                    // content += '<td  onclick=ddfd('+id+','+stat+')>';
                    content += '<td style="color: #fff;">';
                    content += '<label class="custom-control custom-checkbox change_status" >';

                    content += ' <input type="checkbox" onchange=change_status(this) attrid=' + id + ' attrstatus=' + stat + ' class="custom-control-input " ' + check + '>\n';
                    content += '<span class="custom-control-indicator"></span>\n';
                    content += '</label></td>';
                    content += '<td style="color: #fff;"> <button type="button" class="btn" style="background:#7d180e" onclick=deletePledges(' + id + ')>Delete</button> ' +
                        '<button type="button" class="btn" onclick=updatePledges(' + id + ') style="background:#546c7d">Update</button> </td>';
                    content += '</tr>';
                    elem.append(content);
                    content = '';
                }
            }
        });
        $.ajax({
            url: "http://" + endpoint + "/pledges/total",
            type: 'GET',
            success: function (result) {
                totalPledges = result;
                adjustButtons();
            }
        });
    }

    retrievePledges();

    $('#cloas_mod').click(function () {
        $('#up_modal').css('display', 'none')
    })

    $('#save_updated').click(function () {
        var id = $(this).attr('carent_item_id');
        var name = $('#up_name').val();
        var lname = $('#up_lname').val();
        var email = $('#up_email').val();
        var reason = $('#up_reason').val();
        var email_Regex = /[A-Za-z]+(\.|_|-)?([A-Za-z0-9]+(\.|_|-)?)+?([A-Za-z0-9]+(\.|_|-)?)+?[A-Za-z0-9]@[A-Za-z]+(\.|_)?([A-Za-z0-9]+(\.|_|-)?)+?\.[a-z]{2,4}$/;
        var bool = true;
        if (name == '' || name.trim(' ').length < 1){
            bool = false;
            $('#error_up_name').html('Name is required')
            $('#error_up_name').css('display','block')
            $('#up_modal').css('height','742px')
        }
        if (lname == '' || lname.trim(' ').length < 1){
            bool = false;
            $('#error_up_lname').html('Last Name is required')
            $('#error_up_lname').css('display','block')
            $('#up_modal').css('height','742px')
        }
        if(email_Regex.test(email)==false ){
            bool=false;
            $('#error_up_email').html('Invalid Email');
            $('#error_up_email').css('display','block');
            $('#up_modal').css('height','742px')
        }
        if(email=='' ){
            bool=false;
            $('#error_up_email').html('Email is required');
            $('#error_up_email').css('display','block');
            $('#up_modal').css('height','742px')
        }

        if (reason == '' || reason.trim(' ').length < 1){
            bool = false;
            $('#error_up_reason').html('The field is required')
            $('#error_up_reason').css('display','block')
            $('#up_modal').css('height','742px')
        }
        if (bool){
            $.ajax({
                url: "http://" + endpoint + "/pledges/save_updated",
                type: 'POST',
                data: {id: id, name: name, lname: lname, email: email, reason: reason},
                success: function (result) {
                    if (result == 'updated') {
                        location.reload();
                    }
                }
            });
        }
    })


    $('#submit_search').click(function(){
    let input_value=$('#search').val();
if(input_value !='') {
    $.ajax({
        url: "http://" + endpoint + "/search",
        type: 'POST',
        data: {input_value: input_value},
        success: function (result) {
            console.log(result)
            $('#coment_table').html('');
            var elem = $('#coment_table');
            var content = '';
            var id = 0;
            var stat = 0;
            for (var i = 0; i < result.length; i++) {
                id = result[i].id;
                stat = result[i].status;
                var check = '';
                if (result[i].status == 1) {
                    check = 'checked';
                }
                content += '<tr>';
                content += '<td style="color: #fff;">' + result[i].name + '</td>';
                content += '<td style="color: #fff;">' + result[i].lname + '</td>';
                content += '<td style="color: #fff;">' + result[i].email + '</td>';
                content += '<td style="color: #fff;">' + result[i].reason + '</td>';
                content += '<td style="color: #fff;">' + result[i].timestamp + '</td>';
                // content += '<td  onclick=ddfd('+id+','+stat+')>';
                content += '<td style="color: #fff;">';
                content += '<label class="custom-control custom-checkbox change_status" >';

                content += ' <input type="checkbox" onchange=change_status(this) attrid=' + id + ' attrstatus=' + stat + ' class="custom-control-input " ' + check + '>\n';
                content += '<span class="custom-control-indicator"></span>\n';
                content += '</label></td>';
                content += '<td style="color: #fff;"> <button type="button" class="btn" style="background:#7d180e" onclick=deletePledges(' + id + ')>Delete</button> ' +
                    '<button type="button" class="btn" onclick=updatePledges(' + id + ') style="background:#546c7d">Update</button> </td>';
                content += '</tr>';
                elem.append(content);
                content = '';
            }
            $('#clear').css('display', 'initial');
            $('.previous').css('display', 'none');
            $('.more').css('display', 'none');


        }
    });
}

    })




});