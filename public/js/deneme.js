callMessageBoxForUsername();

function callMessageBoxForUsername(message = "Kullanıcı adı seçin") {

    $.MessageBox({
        input: true,
        message: message
    }).done(function (data) {
        if ($.trim(data)) {

            socket.emit('setMyUserName', data);

        }
        else {

            callMessageBoxForUsername();

        }
    });

}