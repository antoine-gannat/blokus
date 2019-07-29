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

    render() {
        // Render the grid
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
        // render
    }
}