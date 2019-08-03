class UiButton {
    constructor(positionRect, backgroundColor, textColor, text, callback) {
        this._positionRect = positionRect;
        this._backgroundColor = backgroundColor;
        this._textColor = textColor;
        this._callback = callback;
        this._text = text;
        this._hide = false;
    }

    changeVisibility() {
        this._hide = !this._hide;
    }

    onClick(click) {
        this._callback();
    }

    render() {
        if (this._hide)
            return;
        g_game._ctx.fillStyle = this._backgroundColor;
        g_game._ctx.fillRect(this._positionRect.x, this._positionRect.y, this._positionRect.width, this._positionRect.height);
        g_game._ctx.font = "20px Arial";
        g_game._ctx.fillStyle = this._textColor;
        g_game._ctx.fillText(this._text, this._positionRect.x + this._positionRect.width / 4, this._positionRect.y + this._positionRect.height / 2);
        g_game._ctx.stroke();
    }
}