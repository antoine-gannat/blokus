const constants = require('./constants');

class Room {
    constructor(server, name) {
        // Room id
        this._id = 'id-' + Math.random().toString(36).substr(2, 16);
        this._name = name;
        this._server = server;
        this._started = false;
        // list of all the players in the room
        this._players = [];
        // index of the next player to play
        this._playerTurnIndex;
        this._map = this.resetMap();
        this._availableColors = [constants.COLORS.BLUE, constants.COLORS.YELLOW, constants.COLORS.RED, constants.COLORS.GREEN];
    }

    // reset the map
    resetMap() {
        var map = new Array(constants.BOARD_SIZE);

        // Allocate the rows
        for (var row = 0; row < constants.BOARD_SIZE; row++) {
            map[row] = new Array(constants.BOARD_SIZE).fill(constants.COLORS.EMPTY);
        }
        return (map);
    }

    emitToRoom(route, data) {
        // for each player
        this._players.forEach((player) => {
            // emit
            player._socket.emit(route, data);
        });
    }

    // Send a list of every player in the room to every player in the room
    broadcastPlayerList() {
        var response = [];
        // prepare the data
        this._players.forEach(p => {
            response.push(p.getPublicData());
        });
        // Send to all users
        this.emitToRoom("player-list", response);
    }

    // Send the map to every player in the room
    broadcastMap() {
        this.emitToRoom("map", this._map);
    }

    canPieceBePlaced(piece, position) {
        // for each row in the shape of the piece
        for (var row = 0; row < constants.SHAPE_MAX_SIZE; row++) {
            // for each column
            for (var col = 0; col < constants.SHAPE_MAX_SIZE; col++) {
                // If the shape has a block at this position and the map is not empty there
                if (piece._shape[row][col] == 1
                    && ((position.x + col >= constants.BOARD_SIZE || position.y + row >= constants.BOARD_SIZE)
                        || (this._map[position.x + col][position.y + row] != constants.COLORS.EMPTY))) {
                    return (false);
                }
            }
        }
        return (true);
    }

    removePlayer(playerId) {
        // search the player
        var playerIndex = this._players.findIndex((p) => { return (p._id == playerId) });
        // If he was found, delete
        if (playerIndex > -1) {
            // add the color back to the colors available
            this._availableColors.push(this._players[playerIndex]._color);
            // remove the player from the player list
            this._players.splice(playerIndex, 1);
            // if there is no more player in the room
            if (this._players.length == 0) {
                // remove the room
                this._server.removeRoom(this._id);
            }
        }
    }

    addPlayer(player) {
        // add the player to the player list
        this._players.push(player);
        // Send the map to the new player
        player._socket.emit("map", this._map);
        // Broadcast the new player list to every player on the list
        this.broadcastPlayerList();
    }

    setPlayerColors() {
        this._players.forEach((player) => {
            // should not happen, but who knows
            if (this._availableColors.length == 0)
                return;
            // assign the first color of the list
            player._color = this._availableColors[0];
            // remove the first color of the list
            this._availableColors.splice(0, 1);
        })
    }

    getPublicInfo() {
        return ({
            id: this._id,
            nbPlayers: this._players.length,
            name: this._name
        })
    }

    // start the game
    start() {
        this._started = true;
        this.setPlayerColors();
    }
}

module.exports = Room;