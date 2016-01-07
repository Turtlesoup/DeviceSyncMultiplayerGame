var express = require('express');
var cors = require('cors')
var io = require('socket.io');
var fs = require('fs');

var app = express();
app.use(express.static('public'));
app.use(cors());

var server = app.listen(process.env.PORT);
var ios = io.listen(server);

app.get('/', function (req, res)
{
    fs.readFile(__dirname + '/index.html', function (err, data){
      if (err)
      {
        res.writeHead(500);
        return res.end('Error loading html');
      }
  
      res.writeHead(200);
      res.end(data);
    });
});

app.get('/game', function (req, res)
{
    fs.readFile(__dirname + '/game.html', function (err, data){
      if (err)
      {
        res.writeHead(500);
        return res.end('Error loading html');
      }
  
      res.writeHead(200);
      res.end(data);
    });
});

function generateRoomID()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var possibleLength = possible.length;

    for( var charIndex = 0; charIndex < 5; charIndex++ )
    {
        text += possible.charAt(Math.floor(Math.random() * possibleLength));
    }

    return text;
}

ios.sockets.on('connection', function (socket) {

  socket.on('relayPlayerTouchStart', function (data) {
    socket.broadcast.to(data.rid).emit('relayingPlayerTouchStart', {pos: data.pos});
  });
  
  socket.on('relayPlayerTouchEnd', function (data) {
    socket.broadcast.to(data.rid).emit('relayingPlayerTouchEnd', {pos: data.pos});
  });
  
  socket.on('createRoom', function() {
    socket.emit('onRoomCreated', {rid: generateRoomID()});
  });
  
  socket.on('joinRoom', function (data) {
    socket.join(data.rid);
    socket.broadcast.to(data.rid).emit('playerJoined', {pid: data.pid});
  });
  
  socket.on('updatePlayerList', function (data) {
    socket.broadcast.to(data.rid).emit('playerListUpdated', {pids: data.pids});
  });
  
  socket.on('startGame', function (data) {
    socket.broadcast.to(data.rid).emit('gameStarted', {});
  });
});