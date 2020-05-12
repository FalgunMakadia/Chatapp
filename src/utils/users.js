const startCase = require('lodash.startcase')

const users = []

const addUser = ({ id, username, room }) => {

    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!username || !room) {
        return {
            error: 'Username and Room both are required!'
        }
    }

    const existingUser = users.find((user) => user.room === room && user.username === username)
    if(existingUser) {
        return {
            error: 'Username is Taken!'
        }
    }

    const user = { id, username, room }
    users.push(user)
    user.username = startCase(user.username)
    user.room = startCase(user.room)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}