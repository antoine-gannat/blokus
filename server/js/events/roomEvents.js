var Room = require('../room');
const constants = require('../constants');

module.exports = (player, server) => {
    // Get the socket
    var socket = player._socket;

    socket.on("join-room", (data) => {
        // Check if player is logged in
        if (!player._username) {
            socket.emit("join-room:response", { error: "You are not logged in" });
            return;
        }
        // Check for missing parameters
        if (!data || !data.roomId) {
            socket.emit("join-room:response", { error: "Missing parameters" });
            return;
        }
        // Get the room
        var room = server._rooms.find((room) => { return (room._id == data.roomId); });
        // if it does not exist
        if (!room) {
            socket.emit("join-room:response", { error: "This room does not exist" });
            return;
        }
        // check if the room is full
        if (room._players.length >= constants.MAX_PLAYER) {
            socket.emit("join-room:response", { error: "This room is already full" });
            return;
        }
        // check if the game in this room has already started
        if (room._started) {
            socket.emit("join-room:response", { error: "The game in this room has already started" });
            return;
        }
        // Search if the username is already taken
        var sameUsernameUser = room._players.find((c) => { return (c._username == player.username) });
        // If a player with this username already exist, send an error
        if (sameUsernameUser) {
            socket.emit("join-room:response", { error: "Someone already has this username in this room, please change" });
            return;
        }
        // save the room
        player._room = room;
        // add the player to the room
        room.addPlayer(player);
        // Success
        socket.emit("join-room:response", { success: "Room joined" });
    });

    socket.on("create-room", (data) => {
        // Check for missing parameters
        if (!data || !data.roomName) {
            socket.emit("create-room:response", { error: "Missing parameters" });
            return;
        }
        // Check if the room name already exist
        var newRoom = new Room(server, data.roomName);
        // save the room
        player._room = newRoom;
        // add the player to the room
        newRoom.addPlayer(player);
        // add the room
        server._rooms.push(newRoom);
        // success
        socket.emit("create-room:response", { success: "Room created" });
    });

    socket.on("place-piece", (data) => {
        // Check if player is logged in
        if (!player._username || !player._room) {
            socket.emit("place-piece:response", { error: "Not connected or not in a room" });
            return;
        }
        // Check for missing parameters
        if (!data || !data.position || !data.piece) {
            socket.emit("place-piece:response", { error: "Missing parameters" });
            return;
        }
        const position = data.position;
        const piece = data.piece;

        if (!this.canPieceBePlaced(piece, position)) {
            this._socket.emit("place-piece:response", { error: "You can't place this piece here" });
            return;
        }
        for (var row = 0; row < constants.SHAPE_MAX_SIZE; row++) {
            for (var col = 0; col < constants.SHAPE_MAX_SIZE; col++) {
                // If the shape has a block at this position
                if (piece._shape[row][col] == 1) {
                    // Place the block
                    this._server._map[position.x + col][position.y + row] = this._color;
                }
            }
        }
        // on success
        this._socket.emit("place-piece:response", { success: "Piece placed" });
        // send the modified map to every player in the room
        this.broadcastMap();
    });

    socket.on("list-rooms", () => {
        var roomsInfo = [];
        server._rooms.forEach((room) => {
            if (!room._started)
                roomsInfo.push(room.getPublicInfo());
        });
        socket.emit("list-rooms:response", roomsInfo);
    });
}