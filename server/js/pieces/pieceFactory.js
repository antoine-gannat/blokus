var Piece = require('./piece');

class PieceFactory {
    // return an array of 21 pieces
    createAllPieces() {
        var pieces = [];

        pieces.push(this.create1x1());
        pieces.push(this.create2x1());
        pieces.push(this.create3x1());
        pieces.push(this.create4x1());
        pieces.push(this.create5x1());
        pieces.push(this.createBigCorner());
        pieces.push(this.createBigL());
        pieces.push(this.createBigT());
        pieces.push(this.createC());
        pieces.push(this.createCorner());
        pieces.push(this.createCross());
        pieces.push(this.createDiagonal());
        pieces.push(this.createF());
        pieces.push(this.createLongS());
        pieces.push(this.createS());
        pieces.push(this.createSmallL());
        pieces.push(this.createSmallT());
        pieces.push(this.createSpecialSquare());
        pieces.push(this.createSquare());
        pieces.push(this.createWeirdT());
        pieces.push(this.createZ());
        // Set pieces ids
        pieces.map((piece, index) => {
            piece._id = index;
        })
        return (pieces);
    }

    // Pieces functions

    create1x1() {
        var piece = new Piece();
        piece.setShape([
            [1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]);
        return (piece);
    }

    create2x1() {
        var piece = new Piece();
        piece.setShape([
            [1, 0, 0, 0, 0],
            [1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]);
        return (piece);
    }

    create3x1() {
        var piece = new Piece();
        piece.setShape([
            [1, 0, 0, 0, 0],
            [1, 0, 0, 0, 0],
            [1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]);
        return (piece);
    }

    create4x1() {
        var piece = new Piece();
        piece.setShape([
            [1, 0, 0, 0, 0],
            [1, 0, 0, 0, 0],
            [1, 0, 0, 0, 0],
            [1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]);
        return (piece);
    }

    create5x1() {
        var piece = new Piece();
        piece.setShape([
            [1, 0, 0, 0, 0],
            [1, 0, 0, 0, 0],
            [1, 0, 0, 0, 0],
            [1, 0, 0, 0, 0],
            [1, 0, 0, 0, 0],
        ]);
        return (piece);
    }

    createBigCorner() {
        var piece = new Piece();
        piece.setShape([
            [1, 1, 1, 0, 0],
            [1, 0, 0, 0, 0],
            [1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]);
        return (piece);
    }

    createBigL() {
        var piece = new Piece();
        piece.setShape([
            [1, 0, 0, 0, 0],
            [1, 0, 0, 0, 0],
            [1, 0, 0, 0, 0],
            [1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]);
        return (piece);
    }

    createBigT() {
        var piece = new Piece();
        piece.setShape([
            [1, 1, 1, 0, 0],
            [0, 1, 0, 0, 0],
            [0, 1, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]);
        return (piece);
    }

    createC() {
        var piece = new Piece();
        piece.setShape([
            [1, 1, 0, 0, 0],
            [1, 0, 0, 0, 0],
            [1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]);
        return (piece);
    }

    createCorner() {
        var piece = new Piece();
        piece.setShape([
            [1, 1, 0, 0, 0],
            [1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]);
        return (piece);
    }

    createSquare() {
        var piece = new Piece();
        piece.setShape([
            [1, 1, 0, 0, 0],
            [1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]);
        return (piece);
    }

    createSmallT() {
        var piece = new Piece();
        piece.setShape([
            [1, 1, 1, 0, 0],
            [0, 1, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]);
        return (piece);
    }

    createSmallL() {
        var piece = new Piece();
        piece.setShape([
            [1, 0, 0, 0, 0],
            [1, 0, 0, 0, 0],
            [1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]);
        return (piece);
    }

    createS() {
        var piece = new Piece();
        piece.setShape([
            [1, 0, 0, 0, 0],
            [1, 1, 0, 0, 0],
            [0, 1, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]);
        return (piece);
    }

    createLongS() {
        var piece = new Piece();
        piece.setShape([
            [1, 0, 0, 0, 0],
            [1, 1, 0, 0, 0],
            [0, 1, 0, 0, 0],
            [0, 1, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]);
        return (piece);
    }

    createSpecialSquare() {
        var piece = new Piece();
        piece.setShape([
            [1, 0, 0, 0, 0],
            [1, 1, 0, 0, 0],
            [1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]);
        return (piece);
    }

    createDiagonal() {
        var piece = new Piece();
        piece.setShape([
            [1, 0, 0, 0, 0],
            [1, 1, 0, 0, 0],
            [0, 1, 1, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]);
        return (piece);
    }

    createWeirdT() {
        var piece = new Piece();
        piece.setShape([
            [1, 1, 0, 0, 0],
            [0, 1, 1, 0, 0],
            [0, 1, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]);
        return (piece);
    }

    createCross() {
        var piece = new Piece();
        piece.setShape([
            [0, 1, 0, 0, 0],
            [1, 1, 1, 0, 0],
            [0, 1, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]);
        return (piece);
    }

    createF() {
        var piece = new Piece();
        piece.setShape([
            [1, 0, 0, 0, 0],
            [1, 1, 0, 0, 0],
            [1, 0, 0, 0, 0],
            [1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]);
        return (piece);
    }

    createZ() {
        var piece = new Piece();
        piece.setShape([
            [1, 1, 0, 0, 0],
            [0, 1, 0, 0, 0],
            [0, 1, 1, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]);
        return (piece);
    }
}

module.exports = new PieceFactory();