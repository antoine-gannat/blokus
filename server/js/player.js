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
        // room of the user
        this._room = null;
        // true if the user is the admin of the room
        this._admin = false;
    }

    // return data only accessible for the player
    getPrivateData() {
        return ({
            id: this._id,
            pieces: this._pieces,
            color: this._color,
            username: this._username
        });
    }

    // return data that can be shared with other players
    getPublicData() {
        return ({
            id: this._id,
            color: this._color,
            usernmae: this._username
        });
    }
}

module.exports = Player;