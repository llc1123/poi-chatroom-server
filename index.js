var socketio = require('socket.io');
var server = require("http").createServer();

var port = 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

var io = socketio.listen(server);

// Chatroom

var numUsers = 0;

io.sockets.on("connection", function(socket){
	var addedUser = false;

	socket.on('new message', function (data) {
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data,
      trusted: socket.trustedUser ? "trusted" : "untrusted",
      timestamp: Date.now()
    });
    socket.emit('self message', {
      message: data,
      trusted: "self",
      timestamp: Date.now()
    })
  });

  socket.on('add user', function (data) {
    if (addedUser) return;

    socket.username = data.name;
    socket.trustedUser = data.real;
    ++numUsers;
    addedUser = true;
    
    socket.emit('login', {
      numUsers: numUsers
    });

    socket.broadcast.emit('user joined', {
      username: socket.username,
      trusted: socket.trustedUser,
      numUsers: numUsers,
      timestamp: Date.now()
    });
  });

  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      socket.broadcast.emit('user left', {
        username: socket.username,
        trusted: socket.trustedUser,
        numUsers: numUsers,
        timestamp: Date.now()
      });
    }
  });
});