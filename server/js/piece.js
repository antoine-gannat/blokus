var constants = require('./constants');

class Piece {
    constructor() {
        // allocate the memory for the shape of the piece (5x5 array)
        this._shape;
        this._orientation = constants.ORIENTATIONS.UP;
    }

    setShape(shape) {
        this._shape = shape;
    }
}

module.exports = Piece;