const COLORS = {
    BLUE: "Blue",
    RED: "Red",
    GREEN: "Green",
    YELLOW: "Yellow",
    EMPTY: "Empty"
}

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
        this._gridSize = { width: g_game._ctx.canvas.width / BOARD_SIZE, height: g_game._ctx.canvas.height / BOARD_SIZE };
    }

    placeBlock(position) {
        // Get block at click position
        var block = { x: Math.floor(position.x / this._gridSize.width), y: Math.floor(position.y / this._gridSize.height) };
        // Set block
        this._map[block.x][block.y] = COLORS.BLUE;
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
            g_game._ctx.lineTo(this._gridSize.width * i, g_game._ctx.canvas.height);
            g_game._ctx.stroke();

            // Draw the horizontal line
            g_game._ctx.beginPath();
            // Start at the left
            g_game._ctx.moveTo(0, this._gridSize.height * i);
            // To the right
            g_game._ctx.lineTo(g_game._ctx.canvas.width, this._gridSize.height * i);
            g_game._ctx.stroke();
        }
    }
}