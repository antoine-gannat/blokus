class PieceList {
    constructor(positionRect) {
        this.resize(positionRect);
        this._selectedPiece = null;
    }

    resize(positionRect) {
        this._positionRect = positionRect;
        // Calculate the size of a block of a piece
        const nbBlocks = NB_OF_PIECES * SHAPE_MAX_SIZE;
        const biggestSide = (this._positionRect.width > this._positionRect.height ? this._positionRect.width : this._positionRect.height);
        this._pieceBlockSize = {
            width: (biggestSide / nbBlocks) * 1.5,
            height: (biggestSide / nbBlocks) * 1.5
        };
        // Margin between each piece
        this._piecesMargin = 20;
        this._lineHeight = this._pieceBlockSize.height * (SHAPE_MAX_SIZE) + this._piecesMargin;
    }

    selectPiece(click) {
        // Disable piece selection until the game has started
        if (!g_game || !g_game._player || !g_game._player.color)
            return;
        // if we already have a selected piece
        if (this._selectedPiece) {
            g_game._player.pieces.push(this._selectedPiece);
            this._selectedPiece = null;
        }
        var selectPieceIndex = -1;
        g_game._player.pieces.map((piece, index) => {
            if (g_game.isPointInRect(click, piece.drawingPos)) {
                this._selectedPiece = piece;
                selectPieceIndex = index;
            }
        });
        if (selectPieceIndex != -1) {
            g_game._player.pieces.splice(selectPieceIndex, 1);
        }
    }

    renderPiece(piece, position, size = this._pieceBlockSize) {
        // for each row
        g_game._ctx.fillStyle = g_game._player.color;
        for (var row = 0; row < SHAPE_MAX_SIZE; row++) {
            // for each column
            for (var col = 0; col < SHAPE_MAX_SIZE; col++) {
                // if the piece has a block here
                if (piece._shape[row][col] == 1) {
                    // Draw the block background
                    g_game._ctx.fillRect(position.x + col * size.width, position.y + row * size.height, size.width, size.height);
                    // Draw the contour
                    g_game._ctx.rect(position.x + col * size.width, position.y + row * size.height, size.width, size.height);
                }
            }
        }
        g_game._ctx.stroke();
    }

    render() {
        const beginXPos = this._positionRect.x + this._piecesMargin;
        var drawingPos = { x: beginXPos, y: this._positionRect.y + this._piecesMargin };
        g_game._ctx.fillStyle = "#E9E9E9";
        g_game._ctx.fillRect(this._positionRect.x, this._positionRect.y, this._positionRect.width, this._positionRect.height);
        // for each piece of the player
        g_game._player.pieces.forEach(piece => {
            // render this piece
            this.renderPiece(piece, drawingPos);
            // save the drawing pos of the piece
            piece.drawingPos = { x: drawingPos.x, y: drawingPos.y, width: piece._size.width * this._pieceBlockSize.width, height: piece._size.height * this._pieceBlockSize.height };
            // change the drawing position to the next one
            drawingPos.x += ((piece._size.width + 1) * this._pieceBlockSize.width) + this._piecesMargin;
            // if the x position is outside of the canvas
            if (drawingPos.x + this._pieceBlockSize.width + this._piecesMargin > this._positionRect.x + this._positionRect.width) {
                // reset x to the begining
                drawingPos.x = beginXPos;
                // increase y position
                drawingPos.y += this._lineHeight;
            }
        });
    }
}