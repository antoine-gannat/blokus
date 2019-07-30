var constants = require('../constants');

class Piece {
    constructor() {
        // allocate the memory for the shape of the piece (5x5 array)
        this._shape;
        this._orientation = constants.ORIENTATIONS.UP;
        this._size;
    }

    setShape(shape) {
        this._shape = shape;
        this._size = { width: this.calculatePieceWidth(shape), height: this.calculatePieceHeight(shape) };
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