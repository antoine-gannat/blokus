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
        this._playerTurnIndex = null;
        this._map = this.resetMap();
        // All available colors ordered according to the first color to play
        this._availableColors = [constants.COLORS.BLUE, constants.COLORS.YELLOW, constants.COLORS.RED, constants.COLORS.GREEN];

        console.log("Room " + name + " created");
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
            response.push(p.getPublicInfo());
        });
        // Send to all users
        this.emitToRoom("player-list", response);
    }

    // Send the map to every player in the room
    broadcastMap() {
        this.emitToRoom("map", this._map);
    }

    // Send to each player it's own private informations
    broadcastPlayerPrivateInfo() {
        this._players.forEach(p => {
            this.sendPlayerInfo(p);
        });
    }

    // Map //

    // Return the number of blocks of this color on the map
    getNbBlockOfColor(researchedColor) {
        var nbBlocksFound = 0;
        // for each row on the map
        this._map.forEach((row) => {
            // For each block on the row
            row.forEach((block) => {
                if (block == researchedColor)
                    nbBlocksFound++;
            });
        });
        return (nbBlocksFound);
    }

    // Piece placement // 

    // Check if a piece of the same color touch one of the sides
    hasFriendlyBlocksOnSides(shapePosition, position, playerColor) {
        var leftPiece = ((position.x + shapePosition.x - 1 >= 0) ? this._map[position.y + shapePosition.y][position.x + shapePosition.x - 1] : null);
        var rightPiece = ((position.x + shapePosition.x + 1 < constants.BOARD_SIZE) ? this._map[position.y + shapePosition.y][position.x + shapePosition.x + 1] : null);
        var topPiece = ((position.y + shapePosition.y - 1 >= 0) ? this._map[position.y + shapePosition.y - 1][position.x + shapePosition.x] : null);
        var downPiece = ((position.y + shapePosition.y + 1 < constants.BOARD_SIZE) ? this._map[position.y + shapePosition.y + 1][position.x + shapePosition.x] : null);

        // Check if the side pieces have the same color as the player
        if (leftPiece && leftPiece == playerColor)
            return (true);
        if (rightPiece && rightPiece == playerColor)
            return (true);
        if (topPiece && topPiece == playerColor)
            return (true);
        if (downPiece && downPiece == playerColor)
            return (true);
        return (false);
    }

    hasFriendlyBlocksOnDiagonals(shapePosition, position, playerColor) {
        // Get the piece color at the top left position (x-1 y-1)
        var topLeftPiece = ((position.x + shapePosition.x - 1 >= 0 && position.y + shapePosition.y - 1 >= 0)
            ? this._map[position.y + shapePosition.y - 1][position.x + shapePosition.x - 1]
            : null);
        // (x+1 y-1)
        var topRightPiece = ((position.x + shapePosition.x + 1 < constants.BOARD_SIZE && position.y + shapePosition.y - 1 >= 0)
            ? this._map[position.y + shapePosition.y - 1][position.x + shapePosition.x + 1]
            : null);
        // (x-1 y+1)
        var downLeftPiece = ((position.y + shapePosition.y + 1 < constants.BOARD_SIZE && position.x + shapePosition.x - 1 >= 0)
            ? this._map[position.y + shapePosition.y + 1][position.x + shapePosition.x - 1]
            : null);
        //(x+1 y+1)
        var downRightPiece = ((position.y + shapePosition.y + 1 < constants.BOARD_SIZE && position.x + shapePosition.x + 1 < constants.BOARD_SIZE)
            ? this._map[position.y + shapePosition.y + 1][position.x + shapePosition.x + 1]
            : null);
        if (topLeftPiece && topLeftPiece == playerColor)
            return (true);
        if (topRightPiece && topRightPiece == playerColor)
            return (true);
        if (downLeftPiece && downLeftPiece == playerColor)
            return (true);
        if (downRightPiece && downRightPiece == playerColor)
            return (true);
        return (false);
    }

    isTryingToPlacePieceInCorner(piece, position) {
        // for each row in the shape of the piece
        for (var row = 0; row < constants.SHAPE_MAX_SIZE; row++) {
            // for each column
            for (var col = 0; col < constants.SHAPE_MAX_SIZE; col++) {
                // If this position on the shape is empty, continue
                if (piece._shape[row][col] == 0)
                    continue;
                // Check if the piece will fit on the map
                if (position.x + col >= constants.BOARD_SIZE || position.y + row >= constants.BOARD_SIZE)
                    continue;
                // Check if the position of the shape is in one of the corners
                if ((position.x + col == 0 && position.y + row == 0) // check for top left corner
                    || (position.x + col == constants.BOARD_SIZE - 1 && position.y + row == 0)// check for top right corner
                    || (position.x + col == 0 && position.y + row == constants.BOARD_SIZE - 1)// check for down left corner
                    || (position.x + col == constants.BOARD_SIZE - 1 && position.y + row == constants.BOARD_SIZE - 1))// check for down right corner
                {
                    return (true);
                }
            }
        }
        // if no corner was found
        return (false);
    }

    // Check if a piece can be placed
    canPieceBePlaced(piece, position, playerColor) {
        var friendlyBlockFound = false;
        // on first piece placed
        if (this.getNbBlockOfColor(playerColor) == 0 && this.isTryingToPlacePieceInCorner(piece, position)) {
            friendlyBlockFound = true;
        }
        // for each row in the shape of the piece
        for (var row = 0; row < constants.SHAPE_MAX_SIZE; row++) {
            // for each column
            for (var col = 0; col < constants.SHAPE_MAX_SIZE; col++) {
                // If this position on the shape is empty, continue
                if (piece._shape[row][col] == 0)
                    continue;
                // Check if the piece will fit on the map
                if (position.x + col >= constants.BOARD_SIZE || position.y + row >= constants.BOARD_SIZE) {
                    return (false);
                }
                // Check if there is already a piece at this position on the map
                if (this._map[position.y + row][position.x + col] != constants.COLORS.EMPTY) {
                    return (false);
                }
                // Check for same color blocks on the side
                if (this.hasFriendlyBlocksOnSides({ x: col, y: row }, position, playerColor)) {
                    return (false);
                }
                if (this.hasFriendlyBlocksOnDiagonals({ x: col, y: row }, position, playerColor))
                    friendlyBlockFound = true;
            }
        }
        // if no friendly blocks were found nearby
        if (!friendlyBlockFound) {
            return (false);
        }
        return (true);
    }

    placePiece(piece, position, playerColor) {
        if (!this.canPieceBePlaced(piece, position, playerColor))
            return (false);
        // for each row in the shape of the piece
        for (var row = 0; row < constants.SHAPE_MAX_SIZE; row++) {
            for (var col = 0; col < constants.SHAPE_MAX_SIZE; col++) {
                // If the shape has a block at this position
                if (piece._shape[row][col] == 1) {
                    // Place the block
                    this._map[position.y + row][position.x + col] = playerColor;
                }
            }
        }
        return (true);
    }
    // Player actions //

    getNextPlayerTurn() {
        // if it's the first turn, give the turn to the blue player
        if (this._playerTurnIndex == null) {
            // The blue player is the first one
            this._playerTurnIndex = 0;
        }
        else {
            // Set to false the playTurn of the previous player 
            this._players[this._playerTurnIndex]._playTurn = false;
            // Get the next player
            if (this._playerTurnIndex + 1 < this._players.length)
                this._playerTurnIndex++;
            else
                this._playerTurnIndex = 0;
        }
        this._players[this._playerTurnIndex]._playTurn = true;
        return (this._playerTurnIndex);
    }

    isPlayerTurn(player) {
        // Get the player index in the player list
        var thisPlayerIndex = this._players.findIndex((p) => { return (p._id == player._id); });

        console.log(thisPlayerIndex);
        // If this player index is not the one that should be playing
        if (thisPlayerIndex != this._playerTurnIndex)
            return (false);
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
                console.log("Deleting room: " + this._name);
                this._server.removeRoom(this._id);
            }
            // resend the player list
            this.broadcastPlayerList();
        }
    }

    addPlayer(player) {
        // if the player is the first one in the room, it's the admin
        if (this._players.length == 0) {
            player._admin = true;
        }
        // add the player to the player list
        this._players.push(player);
        // Send the map to the new player
        player._socket.emit("map", this._map);
        // Broadcast the new player list to every player on the list
        this.broadcastPlayerList();
        this.sendPlayerInfo(player);
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

    sendPlayerInfo(player) {
        player._socket.emit("player-info", player.getPrivateInfo());
    }

    // Room actions //

    getPublicInfo() {
        return ({
            id: this._id,
            nbPlayers: this._players.length,
            name: this._name
        });
    }

    // start the game
    start() {
        console.log("starting room: " + this._name);
        this._started = true;
        // Give the players their colors
        this.setPlayerColors();
        // Get the index of the next player to play
        this.getNextPlayerTurn();
        // Broadcast to all players the list of players
        this.broadcastPlayerList();
        // Broadcase to each player his own private information
        this.broadcastPlayerPrivateInfo();
    }
}

module.exports = Room;