class Map {
    constructor(map) {
        this._map = map;
        this._piecesOpacity = 0.7;
    }

    resize(positionRect) {
        this._positionRect = positionRect;
        // Calculate the grid size
        this._gridSize = { width: positionRect.height / BOARD_SIZE, height: positionRect.height / BOARD_SIZE };

        // change the grid width and height based on the grid size
        this._positionRect.width = this._gridSize.width * BOARD_SIZE;
        this._positionRect.height = this._gridSize.height * BOARD_SIZE;
    }

    render() {
        const boardRect = this._positionRect;
        g_game._ctx.fillStyle = "#F5F5F5";
        // Set a background color for the board
        g_game._ctx.fillRect(this._positionRect.x, this._positionRect.y, this._gridSize.width * BOARD_SIZE, this._gridSize.height * BOARD_SIZE);
        g_game._ctx.globalAlpha = 0.5;
        g_game._ctx.lineWidth = 1;
        // Render the grid
        g_game._ctx.strokeStyle = "black";
        for (var i = 0; i <= BOARD_SIZE; i++) {
            // Draw the vertical line
            g_game._ctx.beginPath();
            // Start at the top
            g_game._ctx.moveTo(boardRect.x + this._gridSize.width * i, boardRect.y);
            // To the bottom
            g_game._ctx.lineTo(boardRect.x + this._gridSize.width * i, boardRect.height + boardRect.y);
            g_game._ctx.stroke();

            // Draw the horizontal line
            g_game._ctx.beginPath();
            // Start at the left
            g_game._ctx.moveTo(boardRect.x, boardRect.y + this._gridSize.height * i);
            // To the right
            g_game._ctx.lineTo(boardRect.width + boardRect.x, boardRect.y + this._gridSize.height * i);
            g_game._ctx.stroke();
        }
        // Draw the board content
        for (var row = 0; row < BOARD_SIZE; row++) {
            for (var col = 0; col < BOARD_SIZE; col++) {
                if (this._map[row][col] == COLORS.EMPTY)
                    continue;
                g_game._ctx.fillStyle = this._map[row][col];
                g_game._ctx.globalAlpha = this._piecesOpacity;
                g_game._ctx.fillRect(boardRect.x + col * this._gridSize.width, boardRect.y + row * this._gridSize.height, this._gridSize.width, this._gridSize.height);
                g_game._ctx.globalAlpha = 1;
                g_game._ctx.rect(boardRect.x + col * this._gridSize.width, boardRect.y + row * this._gridSize.height, this._gridSize.width, this._gridSize.height);
            }
        }
        g_game._ctx.globalAlpha = 1;
    }
}