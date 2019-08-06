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
        var sameUsernameUser = room._players.find((c) => { return (c._username == player._username) });
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
        server.broadcastRooms();
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
        server.broadcastRooms();
    });

    socket.on("place-piece", (data) => {
        // Check if player is logged in
        if (!player._username || !player._room) {
            socket.emit("place-piece:response", { error: "Not connected or not in a room" });
            return;
        }
        // Check for missing parameters
        if (!data || !data.position || data.pieceId == undefined) {
            socket.emit("place-piece:response", { error: "Missing parameters" });
            return;
        }
        var room = player._room;
        const position = data.position;
        const pieceId = data.pieceId;

        // Check if it's this player turn
        if (!room.isPlayerTurn(player)) {
            socket.emit("place-piece:response", { error: "It's not your turn to play, please wait" });
            return;
        }
        // Serach for the piece
        const piece = player._pieces.find((piece) => { return (piece._id == pieceId); });
        if (!piece) {
            socket.emit("place-piece:response", { error: "This piece is not in your inventory" });
            return;
        }
        console.log("tring to place piece(" + pieceId + ") at pos " + position.x + " " + position.y);
        if (!room.placePiece(piece, position, player._color)) {
            socket.emit("place-piece:response", { error: "You can't place this piece here" });
            return;
        }
        // on success
        socket.emit("place-piece:response", { success: "Piece placed" });
        // Get the next player that should play
        room.getNextPlayerTurn();
        // send the modified map to every player in the room
        room.broadcastMap();
        // Send the players infos
        room.broadcastPlayerList();
    });

    socket.on("rotate-piece", (data) => {
        // Check if player is logged in
        if (!player._username || !player._room) {
            socket.emit("rotate-piece:response", { error: "Not connected or not in a room" });
            return;
        }
        // Check for missing parameters
        if (!data || !data.pieceId || data.orientation == undefined) {
            socket.emit("rotate-piece:response", { error: "Missing parameters" });
            return;
        }
        // Serach for the piece
        const piece = player._pieces.find((piece) => { return (piece._id == data.pieceId); });
        if (!piece) {
            socket.emit("rotate-piece:response", { error: "This piece is not in your inventory" });
            return;
        }
        if (data.orientation > 0)
            piece.rotate90();
        else
            piece.rotateNeg90();
        // Send the piece back with a success message
        socket.emit("rotate-piece:response", { success: "Piece rotated", piece: piece });
    });

    socket.on("start-game", () => {
        // Check if the player is in a room
        if (!player._room) {
            socket.emit("start-game:response", { error: "You are not in a room." })
            return;
        }
        // Check if the player is the admin of the room
        if (!player._admin) {
            socket.emit("start-game:response", { error: "You are not the admin of this room." })
            return;
        }
        // start the game in the room
        player._room.start();
        socket.emit("start-game:response", { success: "Game started." })
        server.broadcastRooms();
    });
}