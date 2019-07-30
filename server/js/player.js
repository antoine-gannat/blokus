var pieceFactory = require('./pieceFactory');

class Player {
    constructor(server, socket, color) {
        // Generate a unique id
        this._id = 'id-' + Math.random().toString(36).substr(2, 16);
        this._server = server;
        this._socket = socket;
        this._pieces = pieceFactory.createAllPieces();
        this._color = color;

        // Set event listeners
        this._socket.on("disconnect", this.eventDisconnect.bind(this));
    }

    // Event listeners
    eventDisconnect() {
        console.log("Disconnect player " + this._id);
        this._server.removeClient(this._id);
    }

    getClientData() {
        return ({
            id: this._id,
            pieces: this._pieces,
            color: this._color
        });
    }
}

module.exports = Player;