function callMessageBoxForUsername(message = "Kullanıcı adı seçin") {
    $.MessageBox({
        input: true,
        message: message
    }).done(function (data) {
        if ($.trim(data)) {
            connection.invoke("OnConnectedWithUsername", data).then(function (result) {
                console.log(result);
                if (result != true) {
                    callMessageBoxForUsername("Kullanıcı adı alınmış. Başka bir tane deneyin.");
                }
            });
        } else {
            callMessageBoxForUsername();
        }
    });
}


connection.on("refreshOnlineUsers", function (messageView) {

    var isMine = messageView.from === viewModel.myName();
    if (!isMine) {
        viewModel.userList();
    }
});

connection.on("newMessage", function (messageView) {
    var isMine = messageView.from === viewModel.myName();
    var message = new ChatMessage(messageView.content, messageView.timestamp, messageView.from, isMine, messageView.avatar);
    viewModel.chatMessages.push(message);
    $(".chat-body").animate({ scrollTop: $(".chat-body")[0].scrollHeight }, 1000);
});

connection.on("newGameMessage", function (messageView) {
    var isMine = messageView.from === viewModel.myName();
    var message = new ChatMessage(messageView.Content, messageView.Timestamp, messageView.From, isMine, messageView.Avatar);
    viewModel.gameMessages.push(message);
    $(".chat-body").animate({ scrollTop: $(".chat-body")[0].scrollHeight }, 1000);
});

connection.on("startGame", function (sideData) {

    $('#ask-new-game-modal').modal('hide');
    $('#newGameResponse').html('');

    Pong.initialize(sideData);
    //Pong.running = true;
    //window.requestAnimationFrame(Pong.loop);

});

connection.client.syncBallData = function (messageView) {
    var isMine = messageView.From === viewModel.myName();
    var gelenBall = JSON.parse(messageView.Content);

    if (!isMine) {

        Pong.ball.x = (Pong.canvas.width - gelenBall.x);
        Pong.ball.y = gelenBall.y;
        Pong.ball.speed = gelenBall.speed;

        if (gelenBall.moveX != DIRECTION.IDLE) {
            Pong.ball.moveX = gelenBall.moveX == DIRECTION.LEFT ? DIRECTION.RIGHT : DIRECTION.LEFT;
        }


        //eğer farklıysa değiştir !!!!!!!!!!!!!!!!!!!!!!!!!!
        //Pong.ball.speed = gelenBall.speed;
    }
    else {
    }
};

/*connection.on("syncBallData", function (messageView) {

    var isMine = messageView.from === viewModel.myName();
    var gelenBall = JSON.parse(messageView);
    console.log("gelenball : " + gelenBall);
    console.log("syncBall calisti");

    if (!isMine) {

        Pong.ball.x = (Pong.canvas.width - gelenBall.x);
        Pong.ball.y = gelenBall.y;
        Pong.ball.speed = gelenBall.speed;

        if (gelenBall.moveX != DIRECTION.IDLE) {
            Pong.ball.moveX = gelenBall.moveX == DIRECTION.LEFT ? DIRECTION.RIGHT : DIRECTION.LEFT;
        }


        //eğer farklıysa değiştir !!!!!!!!!!!!!!!!!!!!!!!!!!
        //Pong.ball.speed = gelenBall.speed;
    }
    else {
    }

});*/

connection.client.newGameDataMessage = function (messageView) {
    var isMine = messageView.From === viewModel.myName();

    if (!isMine) {

        var gelenPaddle = JSON.parse(messageView.Content);

        Pong.paddle.move = gelenPaddle.move;
        Pong.paddle.y = gelenPaddle.y;


        //if (messageView.content == 38) {
        //    Pong.paddle.move = DIRECTION.UP;
        //}
        //else if (messageView.content == 40) {
        //    Pong.paddle.move = DIRECTION.DOWN;
        //}
        //else if (messageView.content == "IDLE") {
        //    Pong.paddle.move = DIRECTION.IDLE;
        //}
        //else {
        //    var syncBall = JSON.parse(messageView.content);

        //    var canvas = document.querySelector('canvas');
        //    syncBall.x = ((this.canvas.width / 2) - syncBall.x) * 2;
        //    syncBall.y = ((this.canvas.height / 2) - syncBall.y) * 2;

        //    Pong.ball = syncBall;
        //}
    }

    //var message = new ChatMessage(messageView.content, messageView.timestamp, messageView.from, isMine, messageView.avatar);
    //viewModel.chatMessages.push(message);
    //$(".chat-body").animate({ scrollTop: $(".chat-body")[0].scrollHeight }, 1000);
};

/*connection.on("newGameDataMessage", function (messageView) {
    console.log(messageView);
    var isMine = messageView.from === viewModel.myName();
    console.log(isMine);

    if (!isMine) {

        var gelenPaddle = JSON.parse(messageView.content);
        console.log("gelenPaddle : " + gelenPaddle);

        Pong.paddle.move = gelenPaddle.move;
        Pong.paddle.y = gelenPaddle.y;


        //if (messageView.content == 38) {
        //    Pong.paddle.move = DIRECTION.UP;
        //}
        //else if (messageView.content == 40) {
        //    Pong.paddle.move = DIRECTION.DOWN;
        //}
        //else if (messageView.content == "IDLE") {
        //    Pong.paddle.move = DIRECTION.IDLE;
        //}
        //else {
        //    var syncBall = JSON.parse(messageView.content);

        //    var canvas = document.querySelector('canvas');
        //    syncBall.x = ((this.canvas.width / 2) - syncBall.x) * 2;
        //    syncBall.y = ((this.canvas.height / 2) - syncBall.y) * 2;

        //    Pong.ball = syncBall;
        //}
    }

    //var message = new ChatMessage(messageView.content, messageView.timestamp, messageView.from, isMine, messageView.avatar);
    //viewModel.chatMessages.push(message);
    //$(".chat-body").animate({ scrollTop: $(".chat-body")[0].scrollHeight }, 1000);
});*/

connection.on("getProfileInfo", function (displayName, avatar) {
    viewModel.myName(displayName);
    viewModel.myAvatar(avatar);
});

connection.on("addUser", function (user) {
    viewModel.userAdded(new ChatUser(user.username, user.fullName, user.avatar, user.currentRoom, user.device));
});

connection.on("removeUser", function (user) {
    viewModel.userRemoved(user.username);
});

connection.on("addChatRoom", function (room) {
    viewModel.roomAdded(new ChatRoom(room.id, room.name));
});

connection.on("removeChatRoom", function (room) {
    viewModel.roomDeleted(room.id);
});

connection.on("onError", function (message) {
    viewModel.serverInfoMessage(message);
    $("#errorAlert").removeClass("d-none").show().delay(5000).fadeOut(500);
});

connection.on("onRoomDeleted", function (message) {
    viewModel.serverInfoMessage(message);
    $("#errorAlert").removeClass("d-none").show().delay(5000).fadeOut(500);

    if (viewModel.chatRooms().length - 1 == 0) {
        viewModel.joinedRoom("");
    }
    else {
        // Join to the first room in list
        $("ul#room-list li a")[0].click();
    }
});

function AppViewModel() {
    var self = this;

    self.message = ko.observable("");
    self.chatRooms = ko.observableArray([]);
    self.chatUsers = ko.observableArray([]);
    self.chatMessages = ko.observableArray([]);
    self.gameMessages = ko.observableArray([]);
    self.joinedRoom = ko.observable("");
    self.joinedRoomId = ko.observable("");
    self.serverInfoMessage = ko.observable("");
    self.myName = ko.observable("");
    self.myAvatar = ko.observable("avatar1.png");

    self.onEnter = function (d, e) {
        if (e.keyCode === 13) {
            self.sendNewGameMessage();
        }
        return true;
    }

    self.filter = ko.observable("");
    self.filteredChatUsers = ko.computed(function () {
        if (!self.filter()) {
            return self.chatUsers();
        } else {
            return ko.utils.arrayFilter(self.chatUsers(), function (user) {
                var displayName = user.displayName().toLowerCase();
                return displayName.includes(self.filter().toLowerCase());
            });
        }
    });

    self.sendNewMessage = function () {
        var text = self.message();
        if (text.startsWith("/")) {
            var receiver = text.substring(text.indexOf("(") + 1, text.indexOf(")"));
            var message = text.substring(text.indexOf(")") + 1, text.length);

            if (receiver.length > 0 && message.length > 0)
                connection.invoke("SendPrivate", receiver.trim(), message.trim());
        }
        else {
            if (self.joinedRoom().length > 0 && self.message().length > 0)
                connection.invoke("SendToRoom", self.joinedRoom(), self.message());
        }

        self.message("");
    }

    self.sendNewGameMessage = function () {
        var text = self.message();

        var message = text.substring(text.indexOf(")") + 1, text.length);

        connection.invoke("SendGameMessage", message.trim());

        self.message("");
    }

    var counter = 0;
    //self.listenKeys = function () {

    //    console.log("listenkeys çalişti");

    //    document.addEventListener('keydown', function (key) {

    //        counter++;

    //        if (Pong.running === true) {
    //            connection.invoke("SendGameDataToRoom", "", "playerData", JSON.stringify(Pong.player));

    //            if (counter == 8) { connection.invoke("SendGameDataToRoom", "", "syncBallData", JSON.stringify(Pong.ball)); counter = 0; }
    //        }
    //        else {
    //            connection.invoke("SendGameDataToRoom", "", "readyState", "");
    //        }

    //    });

    //    document.addEventListener('keyup', function (key) {

    //        counter++;

    //        if (Pong.running === true) {
    //            connection.invoke("SendGameDataToRoom", "", "playerData", JSON.stringify(Pong.player));

    //            if (counter == 8) { connection.invoke("SendGameDataToRoom", "", "syncBallData", JSON.stringify(Pong.ball)); counter = 0; }

    //        }
    //        else {
    //            connection.invoke("SendGameDataToRoom", "", "readyState", "");
    //        }
    //    });

    //}

    self.joinRoom = function (room) {
        connection.invoke("Join", room.name()).then(function () {
            self.joinedRoom(room.name());
            self.joinedRoomId(room.id());
            self.userList();
            self.messageHistory();
        });
    }

    self.roomList = function () {
        connection.invoke("GetRooms").then(function (result) {
            self.chatRooms.removeAll();
            for (var i = 0; i < result.length; i++) {
                self.chatRooms.push(new ChatRoom(result[i].id, result[i].name));
            }
        });
    }

    self.userList = function () {
        connection.invoke("GetUsers").then(function (result) {
            self.chatUsers.removeAll();
            for (var i = 0; i < result.length; i++) {
                self.chatUsers.push(new ChatUser(result[i].Username,
                    result[i].FullName,
                    result[i].Avatar,
                    result[i].CurrentRoom,
                    result[i].Device))
            }

        });
    }

    self.createRoom = function () {
        var name = $("#roomName").val();
        connection.invoke("CreateRoom", name);
    }

    self.deleteRoom = function () {
        connection.invoke("DeleteRoom", self.joinedRoom());
    }

    self.ayniRakipleDevam = function () {
        connection.invoke("ContinueGameWithSameUser");
        $("#newGameResponse").html("Rakip bekleniyor..");
    }

    self.yeniRakipAra = function () {
        connection.invoke("SearchGameForMe");
    }

    self.messageHistory = function () {
        connection.invoke("GetMessageHistory", self.joinedRoom()).then(function (result) {
            self.chatMessages.removeAll();
            for (var i = 0; i < result.length; i++) {
                var isMine = result[i].from == self.myName();
                self.chatMessages.push(new ChatMessage(result[i].content,
                    result[i].timestamp,
                    result[i].from,
                    isMine,
                    result[i].avatar))
            }

            $(".chat-body").animate({ scrollTop: $(".chat-body")[0].scrollHeight }, 1000);
        });
    }

    self.roomAdded = function (room) {
        self.chatRooms.push(room);
    }

    self.roomDeleted = function (id) {
        var temp;
        ko.utils.arrayForEach(self.chatRooms(), function (room) {
            if (room.id() == id)
                temp = room;
        });
        self.chatRooms.remove(temp);
    }

    self.userAdded = function (user) {
        self.chatUsers.push(user);
    }

    self.userRemoved = function (id) {
        var temp;
        ko.utils.arrayForEach(self.chatUsers(), function (user) {
            if (user.userName() == id)
                temp = user;
        });
        self.chatUsers.remove(temp);
    }

    self.uploadFiles = function () {
        var form = document.getElementById("uploadForm");
        $.ajax({
            type: "POST",
            url: '/api/Upload',
            data: new FormData(form),
            contentType: false,
            processData: false,
            success: function () {
                $("#UploadedFile").val("");
            },
            error: function (error) {
                alert('Error: ' + error.responseText);
            }
        });
    }
}

// Represent server data
function ChatRoom(id, name) {
    var self = this;
    self.id = ko.observable(id);
    self.name = ko.observable(name);
}

function ChatUser(userName, displayName, avatar, currentRoom, device) {
    var self = this;
    self.userName = ko.observable(userName);
    self.displayName = ko.observable(displayName);
    self.avatar = ko.observable(avatar);
    self.currentRoom = ko.observable(currentRoom);
    self.device = ko.observable(device);
}

function ChatMessage(content, timestamp, from, isMine, avatar) {
    var self = this;
    self.content = ko.observable(content);
    self.timestamp = ko.observable(timestamp);
    self.from = ko.observable(from);
    self.isMine = ko.observable(isMine);
    self.avatar = ko.observable(avatar);
}

var viewModel = new AppViewModel();
ko.applyBindings(viewModel);
