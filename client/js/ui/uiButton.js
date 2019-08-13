class UiButton {
    constructor(positionRect, backgroundColor, textColor, text, callback) {
        this._positionRect = positionRect;
        this._backgroundColor = backgroundColor;
        this._textColor = textColor;
        this._callback = callback;
        this._text = text;
        this._hide = false;
        this._hovered = false;
        this.resize(this._positionRect);
    }

    changeVisibility() {
        this._hide = !this._hide;
    }

    resize(positionRect) {
        this._positionRect = positionRect;
        this._fontSize = this._positionRect.width / this._text.length;
        if (this._fontSize > this._positionRect.height / 2)
            this._fontSize = this._positionRect.height / 2;
    }

    onClick(click) {
        g_game.setDefaultCursor();
        this._callback();
    }

    onHover(click) {
        g_game.setPointerCursor();
        this._hovered = true;
    }

    onHoverOut(click) {
        g_game.setDefaultCursor();
        this._hovered = false;
    }

    render() {
        if (this._hide)
            return;
        g_game._ctx.globalAlpha = 0.9;
        if (this._hovered) {
            g_game._ctx.globalAlpha = 1;
        }
        g_game._ctx.fillStyle = this._backgroundColor;
        g_game._ctx.fillRect(this._positionRect.x, this._positionRect.y, this._positionRect.width, this._positionRect.height);
        g_game._ctx.globalAlpha = 1;
        g_game._ctx.font = this._fontSize + "pt Arial";
        g_game._ctx.fillStyle = this._textColor;
        g_game._ctx.fillText(this._text, this._positionRect.x + (this._positionRect.width / 2) - (g_game._ctx.measureText(this._text).width / 2),
            this._positionRect.y + (this._positionRect.height / 2) + this._fontSize / 2);
        g_game._ctx.stroke();
    }
}