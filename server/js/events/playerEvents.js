const constants = require('../constants');

module.exports = (player, server) => {
    var socket = player._socket;

    // on player disconnection
    socket.on("disconnect", (data) => {
        console.log("Disconnect player " + player._id + " username: " + player._username);
        if (player._room)
            player._room.removePlayer(player._id);
    });

    // on player login
    socket.on("login", (data) => {
        if (!data || !data.username) {
            socket.emit("login:response", { error: "Missing parameters" });
            return;
        }

        console.log("Player " + data.username + " logged in");
        // save the username
        player._username = data.username;
        // On success, Send the player info to the client
        socket.emit("login:response", player.getPrivateData());
    });
}