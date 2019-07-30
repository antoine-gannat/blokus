var express = require('express');
var http = require('http');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var Player = require('./js/player');

const PORT = 4000;

class Server {
    constructor() {
        this._clients = [];
        // List of all the rooms
        this._rooms = [];

        // Start the server
        server.listen(PORT, function () {
            console.log('Starting server on port ' + PORT);
        });
        this._io = io;
        // add callback for client connecting
        this._io.on("connection", (socket) => {
            // create the player
            var player = new Player(this, socket);

            // Set the listeners
            require('./js/events/roomEvents')(player, this);
            require('./js/events/playerEvents')(player, this);
        });
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