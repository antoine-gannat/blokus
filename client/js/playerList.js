class PlayerList {
    constructor(positionRect) {
        this._positionRect = positionRect;
        this._playerList = [];
        this._fontSize = 20;
    }

    setPlayerList(playerList) {
        this._playerList = playerList;
    }

    changeFontSize(newSize) {
        this._fontSize = newSize;
    }

    resize(newPos) {
        this._positionRect = newPos;
    }

    render() {
        const lineSize = this._fontSize;
        const startingY = 50;
        const startingX = 10;
        g_game._ctx.font = this._fontSize + "px Arial";
        g_game._ctx.fillStyle = "black";
        g_game._ctx.fillText("Players :", this._positionRect.x + this._positionRect.width / 4, this._positionRect.y + lineSize);
        this._playerList.map((player, index) => {
            switch (player.color) {
                case COLORS.RED:
                    g_game._ctx.fillStyle = "red";
                    break;
                case COLORS.GREEN:
                    g_game._ctx.fillStyle = "#65A752";
                    break;
                case COLORS.YELLOW:
                    g_game._ctx.fillStyle = "#E3BF47";
                    break;
                case COLORS.BLUE:
                    g_game._ctx.fillStyle = "blue";
                    break;
                default:
                    g_game._ctx.fillStyle = "black";
                    break;
            }
            // display a little arrow if it's the player's turn
            if (player.playTurn)
                g_game._ctx.fillText("- " + player.username + " <-", this._positionRect.x + startingX, this._positionRect.y + startingY + (index) * (lineSize + 2));
            else
                g_game._ctx.fillText("- " + player.username, this._positionRect.x + startingX, this._positionRect.y + startingY + (index) * (lineSize + 2));
        });
    }
}