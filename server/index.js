var express = require('express');
var http = require('http');
var socketIO = require('socket.io');

var app = express();
var httpServer = http.Server(app);
var io = socketIO(httpServer);

var Player = require('./js/player');

const PORT = 4000;

// Host the client
app.use('/', express.static('../client'));

class Server {
    constructor() {
        // List of all the rooms
        this._rooms = [];

        // Start the server
        httpServer.listen(PORT, function () {
            console.log('Starting server on port ' + PORT);
        });
        // add callback for client connecting
        io.on("connection", (socket) => {
            // create the player
            var player = new Player(this, socket);

            // Set the listeners
            require('./js/events/roomEvents')(player, this);
            require('./js/events/playerEvents')(player, this);
        });
    }

    broadcastRooms() {
        var rooms = [];
        this._rooms.forEach((room) => {
            if (!room._started)
                rooms.push(room.getPublicInfo());
        });
        io.sockets.emit("list-rooms", rooms);
    }

    // delete a room
    removeRoom(roomId) {
        // search the room
        var roomIndex = this._rooms.findIndex((r) => { return (r._id == roomId) });
        // If it was found, delete
        if (roomIndex > -1) {
            this._rooms.splice(roomIndex, 1);
        }
    }
}

var server = new Server();