const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid');
const path = require('path');





app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
 })

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).emit('user-connected', userId)
    socket.on("chat",function(chatValue){
      socket.to(roomId).emit("chatLeft",chatValue);
    })

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId)
    })
  })
})


server.listen(process.env.PORT || 3000);