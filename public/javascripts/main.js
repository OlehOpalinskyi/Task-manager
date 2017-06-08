/**
 * Created by Oleh on 01.06.2017.
 */
$(function () {
    /*----------------------- sign in --------------------------*/
    $('#navbar #SignIn').click(function () {
        var email = $('#navbar input[name="email"]');
        var pass = $('#navbar input[name="password"]');
        $.ajax({
            url: '/signin',
            method: 'POST',
            data: {email: email.val(), pas: pass.val()}
        }).done(function (data) {
            if (data === false) {
                alert('Invalid login or password');
                email.val('');
                pass.val('');
            }
            else {
                //window.localStorage.email = email.val();
                document.cookie = "email=" + email.val();
            }
            window.location="http://localhost:8000";
        });
    });
    if(getCookie('email')) {
        $('#navbar #menu').show();
    }
    else {
        $('#navbar form').show();
    }
    /*--------------------------Sing  Out------------------------------*/
    $('#menu .btn-primary').click(function () {
        document.cookie = "email=cvfgvdf; expires=Thu, 18 Dec 2013 12:00:00 UTC";
        window.location="http://localhost:8000";

    });
    /*----------------------delete------------------------*/
    $('#myTasks .del').click(function () {
        var name = $(this).parent().siblings().filter('.name').text();
        $.ajax({
           url: '/delete/' + name,
            method: 'POST'
        }).done(function (data) {
            window.location="http://localhost:8000/MyTask";
        });
    });
    $('#SharedTasks .ShareDel').click(function () {
        var name = $(this).parent().siblings().filter('.name').text();
        $.ajax({
            url: '/share/delete/' + name,
            method: 'POST'
        }).done(function (data) {
            window.location="http://localhost:8000/SharedTask";
        });
    });
    /*---------------------share get-------------------------*/
    $('.share').click(function () {
        nameTask = $(this).parent().siblings().filter('.name').text();
        $.ajax({
           url: '/share',
            method: 'GET'
        }).done(function(data) {
            var select = $('#selectEmail');
            if($('#selectEmail option').length == 0) {
                var lenghtData = data.length;

                for(var i=0; i< lenghtData; i++) {
                    var option = '<option value="' + data[i] +'+' +
                        '">' + data[i] + '</option>';
                    select.append(option);
                }
            }
        });
    });
    /*------------------------share post------------------*/
    $('#shareBtn').click(function () {
        var taskName = nameTask.slice(1);
        var sender = getCookie('email');
        var recipient = $('#selectEmail option:selected').val();
        $.ajax({
            method: 'POST',
            url: '/share',
            data: {name: taskName, sender: sender, recipient: recipient}
        }).done(function (data) {
            alert('Successfuly shared');
        });
    });
    $('#task #update').click(function (e) {
        var start = new Date($('#task input[name="dateStart"]').val());
        var end = new Date($('#task input[name="dateEnd"]').val());
        var status = $('#task #status option:selected').val();
        var currnet = new Date();

        if(start > end) {
            alert('Date of start project can not be bigger then date of end project.');
            e.preventDefault();
        }
        switch (status) {
            case 'Plans': {
                if(start < currnet) {
                    alert('If status: [Plans] date of start can not be less then current date');
                    e.preventDefault();
                }
                break;
            }
            case 'In process': {
                if(end < currnet) {
                    alert('If status: [In process] date of end can not be less then current date');
                    e.preventDefault();
                }
                break;
            }
            case 'Done': {
                if(end > currnet) {
                    alert('If status: [Done] date of end can not be bigger then current date');
                    e.preventDefault();
                }
            }
        }

    });
    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
});
