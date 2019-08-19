var constants = require('../constants');

class Piece {
    constructor() {
        this._id;
        // allocate the memory for the shape of the piece (5x5 array)
        this._shape;
        this._size;
        // The position in the piece that is the closer to the top left corner
        this._topLeftCorner = null;
    }

    setShape(shape) {
        this._shape = shape;
        this._size = { width: this.calculatePieceWidth(shape), height: this.calculatePieceHeight(shape) };
        this.calculateTopLeftCorner();
    }

    rotate90() {
        var newShape = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ];
        for (var row = 0; row < constants.SHAPE_MAX_SIZE; row++) {
            for (var col = 0; col < constants.SHAPE_MAX_SIZE; col++) {
                newShape[col][constants.SHAPE_MAX_SIZE - 1 - row] = this._shape[row][col];
            }
        }
        this._shape = newShape;
        this.calculateTopLeftCorner();
    }

    rotateNeg90() {
        var newShape = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ];
        for (var row = 0; row < constants.SHAPE_MAX_SIZE; row++) {
            for (var col = 0; col < constants.SHAPE_MAX_SIZE; col++) {
                newShape[constants.SHAPE_MAX_SIZE - 1 - col][row] = this._shape[row][col];
            }
        }
        this._shape = newShape;
        this.calculateTopLeftCorner();
    }

    flip() {
        var newShape = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ];
        for (var row = 0; row < constants.SHAPE_MAX_SIZE; row++) {
            for (var col = 0; col < constants.SHAPE_MAX_SIZE; col++) {
                newShape[row][constants.SHAPE_MAX_SIZE - 1 - col] = this._shape[row][col];
            }
        }
        this._shape = newShape;
        this.calculateTopLeftCorner();
    }

    calculateTopLeftCorner() {
        // init at maximum position
        this._topLeftCorner = { x: constants.SHAPE_MAX_SIZE - 1, y: constants.SHAPE_MAX_SIZE - 1 };
        // for each row
        for (var row = 0; row < constants.SHAPE_MAX_SIZE; row++) {
            // for each column
            for (var col = 0; col < constants.SHAPE_MAX_SIZE; col++) {
                // if the block is closer to the top left
                if (this._shape[row][col] == 1 && row < this._topLeftCorner.y && col < this._topLeftCorner.x) {
                    this._topLeftCorner.x = col;
                    this._topLeftCorner.y = row;
                }
            }
        }
    }

    calculatePieceWidth(shape) {
        var maxWidth = 0;
        // for each row
        for (var row = 0; row < constants.SHAPE_MAX_SIZE; row++) {
            var thisWidth = 0;
            // for each column
            for (var col = 0; col < constants.SHAPE_MAX_SIZE; col++) {
                // if we finished the row
                if (shape[row][col] == 0)
                    break;
                // increase this row width
                thisWidth++;
            }
            // if this row is wider than the previous ones
            if (thisWidth > maxWidth)
                maxWidth = thisWidth;
        }
        // return the widest row encountered 
        return (maxWidth);
    }

    calculatePieceHeight(shape) {
        var maxHeight = 0;
        // for each column
        for (var col = 0; col < constants.SHAPE_MAX_SIZE; col++) {
            var thisHeight = 0;
            // for each row
            for (var row = 0; row < constants.SHAPE_MAX_SIZE; row++) {
                // if we finished the column
                if (shape[row][col] == 0)
                    break;
                // increase this column height
                thisHeight++;
            }
            // if this column is higher than the previous ones
            if (thisHeight > maxHeight)
                maxHeight = thisHeight;
        }
        // return the maximum height of the piece 
        return (maxHeight);
    }
}

module.exports = Piece;