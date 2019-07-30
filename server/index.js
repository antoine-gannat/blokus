var express = require('express');
var http = require('http');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var Player = require('./js/player');

const constants = require('./js/constants');

const PORT = 4000;
const MAX_PLAYER = 4;

class Server {
    constructor() {
        this._clients = [];
        this._availableColors = [constants.COLORS.BLUE, constants.COLORS.YELLOW, constants.COLORS.RED, constants.COLORS.GREEN];
        // Start the server
        server.listen(PORT, function () {
            console.log('Starting server on port ' + PORT);
        });

        // add callback for client connecting
        io.on("connection", this.eventConnection.bind(this));
    }

    eventConnection(socket) {
        // too many players
        if (this._clients.length >= MAX_PLAYER || this._availableColors.length == 0) {
            return;
        }
        // Create the new player, and assign him a color
        var newPlayer = new Player(this, socket, this._availableColors[0]);
        // remove the assign color
        this._availableColors.splice(0, 1);
        // add the new player
        this._clients.push(newPlayer);
        console.log("client connected, total:" + this._clients.length);
        // Send the player info to the client
        socket.emit("player-info", newPlayer.getClientData());
    }

    removeClient(clientId) {
        // search the client
        var clientIndex = this._clients.findIndex((c) => { return (c._id == clientId) });
        // If he was found, delete
        if (clientIndex > -1) {
            this._availableColors.push(this._clients[clientIndex]._color);
            this._clients.splice(clientIndex, 1);
        }
    }

    start() {

    }
}

var server = new Server();

server.start();