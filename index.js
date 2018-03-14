const socketio = require('socket.io')
const server = require('http').createServer()

const port = 3000

server.listen(port, () => {
  console.log('Server listening at port %d', port)
})

const io = socketio.listen(server)

// Chatroom

let numUsers = 0

io.sockets.on('connection', (socket) => {
  let addedUser = false

  socket.on('new message', (data) => {
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data,
      trusted: socket.trustedUser ? 'trusted' : 'untrusted',
      timestamp: Date.now()
    })
    socket.emit('self message', {
      message: data,
      trusted: 'self',
      timestamp: Date.now()
    })
    let d = new Date().toISOString()
    console.log(d + '--' + socket.username + ': ' + data)
  })

  socket.on('add user', (data) => {
    if (addedUser) return

    socket.username = data.name
    socket.trustedUser = data.real
    ++numUsers
    addedUser = true
    
    socket.emit('login', {
      numUsers: numUsers
    })

    socket.broadcast.emit('user joined', {
      username: socket.username,
      trusted: socket.trustedUser,
      numUsers: numUsers,
      timestamp: Date.now()
    })
    let d = new Date().toISOString()
    console.log(d + '--' + socket.username + ' joined the chat, Current User: ' + numUsers)
  })

  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers

      socket.broadcast.emit('user left', {
        username: socket.username,
        trusted: socket.trustedUser,
        numUsers: numUsers,
        timestamp: Date.now()
      })
      let d = new Date().toISOString()
      console.log(d + '--' + socket.username + ' left the chat, Current User: '+ numUsers)
    }
  })
})