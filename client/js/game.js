class Game {
    constructor() {
        // Get the canvas
        this._canvas = document.getElementById("game-canvas");
        // get the canvas context
        this._ctx = this._canvas.getContext("2d");

        // Set the canvas size to 90% of the screen size
        const boardToScreenRatio = 5;
        const borderPadding = ((boardToScreenRatio * window.innerHeight) / 100);
        // Set the size of the canvas
        this._ctx.canvas.width = window.innerHeight - borderPadding;
        this._ctx.canvas.height = window.innerHeight - borderPadding;
        // Set the margin of the canvas
        this._ctx.canvas.style.marginLeft = ((window.innerWidth - this._ctx.canvas.width) / 2) + "px";
        this._ctx.canvas.style.marginTop = (borderPadding / 2) + "px";
        // generate the map
        this._map = new Map();
        // add an event listener on the canvas
        this._canvas.addEventListener("click", this.onClick.bind(this));
        // The player
        this._player;
        // Connect to the server
        console.log("Connect to " + SERVER_URL + ":" + SERVER_PORT);
        this.socket = io.connect(SERVER_URL + ":" + SERVER_PORT, { secure: true });

        // Set listeners
        this.socket.on("player-info", this.onPlayerInfo.bind(this));
    }

    onPlayerInfo(player) {
        this._player = player;
        console.log(player);
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
        this._map.render();
    }

    onClick(clickEvent) {
        // Calculate the position of the canvas
        var xCanvasPos = ((window.innerWidth - this._ctx.canvas.width) / 2);
        var yCanvasPos = ((window.innerHeight - this._ctx.canvas.height) / 2);
        // Create a new element with the click position relative to the canvas
        var click = { x: clickEvent.clientX - xCanvasPos, y: clickEvent.clientY - yCanvasPos };
        // If the position are negative, set to 0
        if (click.x < 0)
            click.x = 0;
        if (click.y < 0)
            click.y = 0;
        this._map.placeBlock(click);
    }
}