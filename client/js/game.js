class Game {
    constructor() {
        // Set the canvas size to 90% of the screen size
        const boardToScreenRatio = 5;
        this._borderPadding = ((boardToScreenRatio * window.innerHeight) / 100);
        // size of the menu containing the pieces 
        this._sideMenuSize = { width: (20 * window.innerWidth) / 100, height: window.innerHeight - this._borderPadding };
        this._boardSize = { width: window.innerHeight - this._borderPadding, height: window.innerHeight - this._borderPadding };
        // generate the map
        this._map = new Map();
        // The player
        this._player = null;
        // Connect to the server
        console.log("Connect to " + SERVER_URL + ":" + SERVER_PORT);
        this._socket = io.connect(SERVER_URL + ":" + SERVER_PORT, { secure: true });

        // Set listeners
        // On login response
        this._socket.on("login:response", this.onLoginResponse.bind(this));
        // On player list received
        this._socket.on("player-list", this.onPlayerList.bind(this));
        // On map received
        this._socket.on("map", this.onMapReceived.bind(this));
        // On map received
        this._socket.on("place-piece:response", this.onPiecePlaced.bind(this));
        // On rooms received
        this._socket.on("list-rooms:response", this.onListRooms.bind(this));
        // On create rooms response
        this._socket.on("join-room:response", this.onJoinRoomResponse.bind(this));
        // On create rooms response
        this._socket.on("create-room:response", this.onCreateRoomResponse.bind(this));

        // allow to start the game when the 'enter' key is pressed
        document.getElementById("username-input").addEventListener("keyup", (event) => {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
                // Cancel the default action, if needed
                event.preventDefault();
                // click on the button
                document.getElementById("login-btn").click();
            }
        });

        // Create the side menu
        this._sideMenu = new SideMenu({
            x: this._boardSize.width,
            y: 0
        }, this._sideMenuSize);

        // Last known position of the mouse
        this._mousePos = { x: 0, y: 0 };
        this._socket.emit("list-rooms");
    }

    // ask for a list of room
    initCanvas() {
        // delete the login menu
        var loginMenu = document.getElementById("login-container");
        loginMenu.parentNode.removeChild(loginMenu);

        // create the canvas
        this._canvas = document.createElement("canvas");
        // add the canvas to the body
        document.body.appendChild(this._canvas);
        // get the canvas context
        this._ctx = this._canvas.getContext("2d");

        // Set the size of the canvas
        this._ctx.canvas.width = this._boardSize.width + this._sideMenuSize.width;
        this._ctx.canvas.height = this._boardSize.height;

        // Set the margin of the canvas
        this._ctx.canvas.style.marginLeft = ((window.innerWidth - this._ctx.canvas.width) / 2) + "px";
        this._ctx.canvas.style.marginTop = (this._borderPadding / 2) + "px";

        // add an event listener on the canvas
        this._canvas.addEventListener("click", this.onClick.bind(this));
        this._canvas.addEventListener("mousemove", this.saveMousePos.bind(this));
    }

    login(username) {
        // authenticate
        this._socket.emit("login", { username: username });
    }

    joinRoom(roomId) {
        this._socket.emit("join-room", { roomId: roomId });
    }

    createRoom(roomName) {
        this._socket.emit("create-room", { roomName: roomName });
    }

    onJoinRoomResponse(data) {
        if (data.error) {
            alert(data.error);
            return;
        }
        this.run();
    }

    onCreateRoomResponse(data) {
        if (data.error) {
            alert(data.error);
            return;
        }
        // on success, go to the game
        this.run();
    }

    // on list room
    onListRooms(rooms) {
        var roomTable = document.getElementById("room-table");
        if (rooms.length == 0) {
            roomTable.innerHTML = "<p>No room found. Create a new one</p>";
            return;
        }
        roomTable.innerHTML = "";
        rooms.forEach((room) => {
            roomTable.innerHTML += "<tr>\
                <td>" + room.name + "</td>\
                <td>" + room.nbPlayers + "/4</td>\
                <td><button onclick=\"g_game.joinRoom('" + room.id + "')\" class=\"btn btn-secondary\">Join</button></td>\
            </tr>";
        });
    }

    // When receving the player list
    onPlayerList(playerList) {
        var playerListElement = document.getElementById("player-list");
        playerListElement.innerHTML = "";
        playerList.forEach((player) => {
            playerListElement.innerHTML += "<li style='color:" + player.color + "'>" + player.username + "</li>";
        });
    }

    onLoginResponse(data) {
        if (data.error) {
            alert(data.error);
            // reload window
            window.location.reload();
            return;
        }
        // on success, save the player data
        this._player = data;
        document.getElementById("login-btn").disabled = "true";
        document.getElementById("login-btn").style.backgroundColor = "green";
        document.getElementById("room-actions-container").style.visibility = "visible";
    }

    onMapReceived(map) {
        this._map = new Map(map);
        this._map.init();
    }

    onPiecePlaced(response) {
        if (response.success) {
            this._sideMenu._selectedPiece = null;
        }
        else if (response.error) {
            alert(response.error);
        }
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
        // init the canvas
        this.initCanvas();
        // init the map
        this._map.init();
        // infinite loop that will loop at 60fps
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
        var mousePosModified = { x: this._mousePos.x - this._map._gridSize.width / 2, y: this._mousePos.y - this._map._gridSize.height / 2 };
        // render the piece 
        this._sideMenu.renderPiece(piece, mousePosModified, this._map._gridSize);
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
            this._socket.emit("place-piece", {
                piece: this._sideMenu._selectedPiece,
                position: { x: Math.floor(click.x / this._map._gridSize.width), y: Math.floor(click.y / this._map._gridSize.height) }
            });
        }
        else if (this.isClickOnSideMenu(click))
            this._sideMenu.selectPiece(click);
    }
}