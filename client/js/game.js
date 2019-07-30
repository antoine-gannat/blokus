class Game {
    constructor() {
        // Get the canvas
        this._canvas = document.getElementById("game-canvas");
        // get the canvas context
        this._ctx = this._canvas.getContext("2d");

        // Set the canvas size to 90% of the screen size
        const boardToScreenRatio = 5;
        const borderPadding = ((boardToScreenRatio * window.innerHeight) / 100);
        // size of the menu containing the pieces 
        this._sideMenuSize = { width: (20 * window.innerWidth) / 100, height: window.innerHeight - borderPadding };
        this._boardSize = { width: window.innerHeight - borderPadding, height: window.innerHeight - borderPadding };
        // Set the size of the canvas
        this._ctx.canvas.width = this._boardSize.width + this._sideMenuSize.width;
        this._ctx.canvas.height = this._boardSize.height;
        // Set the margin of the canvas
        this._ctx.canvas.style.marginLeft = ((window.innerWidth - this._ctx.canvas.width) / 2) + "px";
        this._ctx.canvas.style.marginTop = (borderPadding / 2) + "px";
        // generate the map
        this._map = new Map();
        // add an event listener on the canvas
        this._canvas.addEventListener("click", this.onClick.bind(this));
        this._canvas.addEventListener("mousemove", this.saveMousePos.bind(this));
        // The player
        this._player = null;
        // Connect to the server
        console.log("Connect to " + SERVER_URL + ":" + SERVER_PORT);
        this._socket = io.connect(SERVER_URL + ":" + SERVER_PORT, { secure: true });

        // Set listeners
        this._socket.on("player-info", this.onPlayerInfo.bind(this));
        this._sideMenu = new SideMenu({
            x: this._boardSize.width,
            y: 0
        }, this._sideMenuSize);

        // Last known position of the mouse
        this._mousePos = { x: 0, y: 0 };
    }

    onPlayerInfo(player) {
        this._player = player;
    }

    // sleep for 'ms' milliseconds
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // main loop of the game
    async run() {
        const FRAME_MAX_DURATION = 1000.0 / FRAMES_PER_SECONDS;
        var frameStartTime;
        var frameDuration;
        // infinite loop that will loop at 60fps
        this._map.init();
        while (true) {
            // get the frame start time
            frameStartTime = new Date().getMilliseconds();
            // Execute a tick
            this.tick();

            // get the render duration of the frame
            frameDuration = new Date().getMilliseconds() - frameStartTime;
            // If the frame was rendered too fast
            if (frameDuration < FRAME_MAX_DURATION) {
                // wait a bit if the frame was rendered faster that 60fps
                await this.sleep(FRAME_MAX_DURATION - frameDuration);
            }
        }
    }

    tick() {
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._ctx.fillStyle = "#F5F5F5";
        this._ctx.fillRect(0, 0, this._boardSize.width, this._boardSize.height);
        // don't render the board or the sidemenu until the player is connected
        if (!this._player)
            return;
        this._map.render();
        this._sideMenu.render();
        this.renderSelectedPiece();
    }

    renderSelectedPiece() {
        const piece = this._sideMenu._selectedPiece;
        if (!piece)
            return;
        // render the piece 
        this._sideMenu.renderPiece(piece, this._mousePos, this._map._gridSize);
    }


    // clicks

    getMousePosOnCanvas(event) {
        // Calculate the position of the canvas
        var xCanvasPos = ((window.innerWidth - this._ctx.canvas.width) / 2);
        var yCanvasPos = ((window.innerHeight - this._ctx.canvas.height) / 2);
        // Create a new element with the click position relative to the canvas
        return ({ x: event.clientX - xCanvasPos, y: event.clientY - yCanvasPos });
    }

    saveMousePos(event) {
        const click = this.getMousePosOnCanvas(event)
        this._mousePos.x = click.x;
        this._mousePos.y = click.y;
    }

    // return true if the point is in the rectangle
    isPointInRect(point, rect) {
        return (point.x >= rect.x && point.x <= rect.x + rect.width
            && point.y >= rect.y && point.y <= rect.y + rect.height);
    }

    isClickOnBoard(click) {
        return (this.isPointInRect(click, { x: 0, y: 0, width: this._boardSize.width, height: this._boardSize.height }));
    }

    isClickOnSideMenu(click) {
        return (this.isPointInRect(click, { x: this._sideMenu._position.x, y: this._sideMenu._position.y, width: this._sideMenu._size.width, height: this._sideMenu._size.height }));
    }

    onClick(event) {
        const click = this.getMousePosOnCanvas(event)

        // If the position are negative, set to 0
        if (click.x < 0)
            click.x = 0;
        if (click.y < 0)
            click.y = 0;

        if (this.isClickOnBoard(click) && this._sideMenu._selectedPiece) {
            // if the place was correctly placed, delete the piece
            if (this._map.placePiece(this._sideMenu._selectedPiece, click, this._player.color))
                this._sideMenu._selectedPiece = null;
        }
        else if (this.isClickOnSideMenu(click))
            this._sideMenu.selectPiece(click);
    }
}