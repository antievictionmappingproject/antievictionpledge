$(document).ready(function () {
    var endpoint = "localhost:8888";

    $('#login').click(function () {
        var bool = true;
        var username = $('#username').val();
        var password = $('#password').val();
        if (username == '') {
            bool = false;
        }
        if (password == '') {
            bool = false;
        }
        if (bool) {
            var data = {
                username: username,
                password: password,
            };
            $.ajax({
                url: "http://" + endpoint + "/login",
                data: data,
                type: 'POST',
                success: function (result) {
                    if(result=='1'){
                        $(function() {
                            $.session.set("myLoginKey", "fdb5dfb15fdb85fd5bdf845b5fdb8fd5bfd84b5dfb854fbdf8b52dfb8df45b");
                        });

                        window.location.href=window.location.origin +"/admin_dashboard/View";
                    }
                }
            });
        }
    });


});

