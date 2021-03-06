const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const moment = require('moment');
var sleep = require('thread-sleep');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

var list = new Array;

setInterval(matchPlayers, 2000);

function matchPlayers(params) {
  if (list.length > 1) {
    var socketsSearchingGame = list.filter(x => x._user.SEARCHINGGAME == true);

    for (var i = 0; i < socketsSearchingGame.length; i++) {
      var x = socketsSearchingGame[0];
      var socket = socketsSearchingGame[i];

      if (x._user.USERNAME !== socket._user.USERNAME) {
        x._user.SEARCHINGGAME = false;
        socket._user.SEARCHINGGAME = false;

        x._user.ENEMYSOCKET = socket;
        x.emit('message', formatMessage('Chat Bot', socket._user.USERNAME + ' rakibiniz'));

        socket._user.ENEMYSOCKET = x;
        socket.emit('message', formatMessage('Chat Bot', x._user.USERNAME + ' rakibiniz'));

        x.emit('oyunuBaslat', { enemyPlayer: socket._user.USERNAME, direction: 'left' });
        socket.emit('oyunuBaslat', { enemyPlayer: x._user.USERNAME, direction: 'right' });

        socketsSearchingGame = list.filter(x => x._user.SEARCHINGGAME == true);
      }
    }

    // socketsSearchingGame.forEach(x => {
    //   if (x._user.USERNAME !== socket._user.USERNAME) {

    //     x._user.SEARCHINGGAME = false;
    //     socket._user.SEARCHINGGAME = false;

    //     x._user.ENEMYSOCKET = socket;
    //     x.emit('message', formatMessage('Chat Bot', socket._user.USERNAME + ' rakibiniz'));

    //     socket._user.ENEMYSOCKET = x;
    //     socket.emit('message', formatMessage('Chat Bot', x._user.USERNAME + ' rakibiniz'));

    //     x.emit('oyunuBaslat', { enemyPlayer: socket._user.USERNAME, direction: 'left' });
    //     socket.emit('oyunuBaslat', { enemyPlayer: x._user.USERNAME, direction: 'right' });

    //   }
    // });
  }
}

//Run when client connect
io.on('connection', (socket) => {

  socket.on('add_user', function (username) {

    var userNameIsOk = true;

    list.forEach(socketList => {
      if (socketList._user.USERNAME.toString() === username.toString()) {
        userNameIsOk = false;
        console.log("false = " + userNameIsOk);
        socket.emit('userNameError', '');
      }
    });

    if (userNameIsOk) {

      // we store the username in the socket session for this client
      socket._user = new User(USERNAME = username);

      list.push(socket);

      list.forEach(socket =>
        console.log(socket._user.USERNAME)
      );

      // Welcome message to current user 
      socket.emit('message', formatMessage('Chat Bot', "Hi  welcome to ertus's server."));

    }

  });

  socket.on('sendPlayerPongDataToEnemy', msg => {
    socket._user.ENEMYSOCKET.emit('getEnemyPaddleData', msg);
  });

  socket.on('sendSyncBallDataToEnemy', msg => {
    socket._user.ENEMYSOCKET.emit('getSyncBallData', msg);
  });

  socket.on('sendYouWonDataToEnemy', msg => {
    socket._user.ENEMYSOCKET.emit('getYouWonData', msg);
  });

  socket.on('sendKeepPlaying', msg => {

  
    socket._user.SEARCHINGGAME = true;

  });

  socket.on('disconnect', () => {
    if (socket._user != undefined) {
      io.emit('message', formatMessage('Chat Bot', socket._user.USERNAME + ' ayrıldı'));
      console.log(socket._user.USERNAME + ' ayrıldı');
      for (var i = 0; i < list.length; i++) {

        if (list[i]._user === socket._user) {
          list.splice(i, 1);
        }
      }
    }
  });

  socket.on('chatMessage', msg => {
    io.emit('message', formatMessage(socket._user.USERNAME, msg));
  });


});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

function User(userName, searchingGame = true, enemySocket = null, keepPlayWithThatUser = false) {
  this.USERNAME = userName;
  this.SEARCHINGGAME = searchingGame;
  this.ENEMYSOCKET = enemySocket;
  this.KEEPPLAYWITHTHATUSER = keepPlayWithThatUser;
}

function formatMessage(userName, text) {
  return {
    userName,
    text,
    time: moment().format('DD.MM.YYYY hh:mm:ss'),
  }
}