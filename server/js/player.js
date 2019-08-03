var pieceFactory = require('./pieces/pieceFactory');

class Player {
    constructor(server, socket) {
        // Generate a unique id
        this._id = 'id-' + Math.random().toString(36).substr(2, 16);
        this._server = server;
        this._socket = socket;
        // Generate all the pieces of the player
        this._pieces = pieceFactory.createAllPieces();
        this._color = null;
        this._username = null;
        this._playTurn = false;
        // room of the user
        this._room = null;
        // true if the user is the admin of the room
        this._admin = false;
    }

    // return data only accessible for the player
    getPrivateInfo() {
        return ({
            id: this._id,
            pieces: this._pieces,
            color: this._color,
            username: this._username,
            admin: this._admin,
            playTurn: this._playTurn
        });
    }

    // return data that can be shared with other players
    getPublicInfo() {
        return ({
            id: this._id,
            color: this._color,
            username: this._username,
            admin: this._admin,
            playTurn: this._playTurn
        });
    }
}

module.exports = Player;