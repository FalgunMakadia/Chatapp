const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('../src/utils/messages') 
const { addUser, removeUser, getUser, getUsersInRoom } = require('../src/utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

io.on('connection', (socket) => {
    console.log('New WebSocket Connected!')

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        
        if(error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('White Shadow','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('White Shadow',`$ ${user.username} has joined the Chat-room!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room),
            currentUser: user.username
        })

        callback()
    })
    
    socket.on('sendMessage', (msg, callback) => {
        const filter = new Filter()
        if(filter.isProfane(msg)){
            return callback('Profanity is not Allowed!')
        }
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, msg))
        callback()
    })

    socket.on('sendLocation', (position, callback) => {
        const {latitude, longitude} = position
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${latitude},${longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', generateMessage('White Shadow',`$ ${user.username} has left the Chat-room!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room),
                currentUser: user.username
            })            
        }
        
    })
})

const port = process.env.PORT || 3000
const pathToPublic = path.join(__dirname, '../public')
app.use(express.static(pathToPublic))

server.listen(port, () => {
    console.log('ChatApp is up on port ', + port)
})