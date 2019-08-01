class Map {
    constructor(map) {
        this._map = map;
        this._piecesOpacity = 0.7;
    }

    init() {
        this._gridSize = { width: g_game._boardSize.width / BOARD_SIZE, height: g_game._boardSize.height / BOARD_SIZE };
        // Calculate the grid size
    }

    render() {
        g_game._ctx.globalAlpha = 0.5;
        g_game._ctx.lineWidth = 1;
        // Render the grid
        g_game._ctx.strokeStyle = "black";
        for (var i = 0; i <= BOARD_SIZE; i++) {
            // Draw the vertical line
            g_game._ctx.beginPath();
            // Start at the top
            g_game._ctx.moveTo(this._gridSize.width * i, 0);
            // To the bottom
            g_game._ctx.lineTo(this._gridSize.width * i, g_game._boardSize.height);
            g_game._ctx.stroke();

            // Draw the horizontal line
            g_game._ctx.beginPath();
            // Start at the left
            g_game._ctx.moveTo(0, this._gridSize.height * i);
            // To the right
            g_game._ctx.lineTo(g_game._boardSize.width, this._gridSize.height * i);
            g_game._ctx.stroke();
        }
        // Draw the board content
        for (var col = 0; col < BOARD_SIZE; col++) {
            for (var row = 0; row < BOARD_SIZE; row++) {
                if (this._map[row][col] == COLORS.EMPTY)
                    continue;
                switch (this._map[row][col]) {
                    case COLORS.RED:
                        g_game._ctx.fillStyle = "red";
                        break;
                    case COLORS.GREEN:
                        g_game._ctx.fillStyle = "green";
                        break;
                    case COLORS.YELLOW:
                        g_game._ctx.fillStyle = "yellow";
                        break;
                    case COLORS.BLUE:
                        g_game._ctx.fillStyle = "blue";
                        break;
                    default:
                        break;
                }
                g_game._ctx.globalAlpha = this._piecesOpacity;
                g_game._ctx.fillRect(col * this._gridSize.width, row * this._gridSize.width, this._gridSize.width, this._gridSize.height);
                g_game._ctx.globalAlpha = 1;
                g_game._ctx.rect(col * this._gridSize.width, row * this._gridSize.width, this._gridSize.width, this._gridSize.height);
            }
        }
        g_game._ctx.globalAlpha = 1;
    }
}