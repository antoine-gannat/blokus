class Map {
    constructor() {
        // Allocate the columns
        this._map = new Array(BOARD_SIZE);

        // Allocate the rows
        for (var row = 0; row < BOARD_SIZE; row++) {
            this._map[row] = new Array(BOARD_SIZE).fill(COLORS.EMPTY);
        }
    }

    init() {
        // Calculate the grid size
        this._gridSize = { width: g_game._boardSize.width / BOARD_SIZE, height: g_game._boardSize.height / BOARD_SIZE };
    }

    placePiece(piece, position, playerColor) {
        // Get block at click position
        var block = { x: Math.floor(position.x / this._gridSize.width), y: Math.floor(position.y / this._gridSize.height) };

        // Start by checking if we can place the piece there
        for (var row = 0; row < SHAPE_MAX_SIZE; row++) {
            for (var col = 0; col < SHAPE_MAX_SIZE; col++) {
                // If the shape has a block at this position and the map is not empty there
                if (piece._shape[row][col] == 1 && this._map[block.x + col][block.y + row] != COLORS.EMPTY) {
                    return (false);
                }
            }
        }
        // Now that we know the map is empty at this emplacement, copy the piece there
        for (var row = 0; row < SHAPE_MAX_SIZE; row++) {
            for (var col = 0; col < SHAPE_MAX_SIZE; col++) {
                // If the shape has a block at this position
                if (piece._shape[row][col] == 1) {
                    // Place the block
                    this._map[block.x + col][block.y + row] = playerColor;
                }
            }
        }
        return (true);
    }

    render() {
        // Draw the board content
        for (var col = 0; col < BOARD_SIZE; col++) {
            for (var row = 0; row < BOARD_SIZE; row++) {
                if (this._map[col][row] == COLORS.EMPTY)
                    continue;
                switch (this._map[col][row]) {
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
                g_game._ctx.fillRect(col * this._gridSize.width, row * this._gridSize.width, this._gridSize.width, this._gridSize.height);
            }
        }
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
    }
}