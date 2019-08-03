class Game {
    constructor() {
        // generate the map
        this._map = new Map();
        // The player
        this._player = null;
        // UI elements
        this._uis = [];
        // Set the sizes according to the screen size
        this.resize();
        // Connect to the server
        console.log("Connect to " + SERVER_URL + ":" + SERVER_PORT);
        this._socket = io.connect(SERVER_URL + ":" + SERVER_PORT, { secure: true });

        // Set listeners
        // On login response
        this._socket.on("connect_error", (error) => {
            Notifications.error("Unable to reach the server, try again later");
        });
        this._socket.on("login:response", this.onLoginResponse.bind(this));
        // On player list received
        this._socket.on("player-list", this.onPlayerList.bind(this));
        // On map received
        this._socket.on("map", this.onMapReceived.bind(this));
        // On map received
        this._socket.on("place-piece:response", this.onPiecePlaced.bind(this));
        // On rooms received
        this._socket.on("list-rooms:response", this.onListRooms.bind(this));
        // On join rooms response
        this._socket.on("join-room:response", this.onJoinRoomResponse.bind(this));
        // On create rooms response
        this._socket.on("create-room:response", this.onCreateRoomResponse.bind(this));
        // On start game response
        this._socket.on("start-game:response", this.onStartGameResponse.bind(this));
        // On player info (information about the player)
        this._socket.on("player-info", this.onPlayerInfo.bind(this));
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
        window.addEventListener("resize", this.resize.bind(this), false);
        // Create the piece list
        this._pieceList = new PieceList(this._pieceListMenuRect);
        // Create the player list
        this._playerList = new PlayerList(this._playerListMenuRect);

        // Last known position of the mouse
        this._mousePos = { x: 0, y: 0 };
        this._socket.emit("list-rooms");
    }

    // screen size adaptation //

    isSmallScreen() {
        const smallScreenMaxWidth = 1000;
        if (window.innerWidth <= smallScreenMaxWidth)
            return (true);
        return (false);
    }

    resize() {
        // Resize for small screens
        if (this.isSmallScreen()) {
            const bottomMenuHeightPercentage = 20;
            const playerListWidthPercentage = 10;
            const bottomMenuHeight = (bottomMenuHeightPercentage * window.innerHeight) / 100;
            // Set the size of the board (full width on small screens)
            this._boardSizeRect = {
                width: window.innerHeight,
                height: window.innerHeight - bottomMenuHeight,
                x: 0,
                y: 0
            };
            // Set the size of the player list
            this._playerListMenuRect = {
                width: (playerListWidthPercentage * window.innerWidth) / 100,
                height: bottomMenuHeight,
                x: 0,
                y: this._boardSizeRect.height
            };
            // Set the size of the piece list
            this._pieceListMenuRect = {
                width: window.innerWidth - this._playerListMenuRect.width,
                height: bottomMenuHeight,
                x: this._playerListMenuRect.width,
                y: this._boardSizeRect.height
            }
        }
        // Big screens
        else {
            const playerListWidthPercentage = 10;
            const pieceListWidthPercentage = 20;
            // Set the size of the player list
            this._playerListMenuRect = {
                width: (playerListWidthPercentage * window.innerWidth) / 100,
                height: window.innerHeight,
                x: 0,
                y: 0
            };
            // Set the size of the piece list
            this._pieceListMenuRect = {
                width: (pieceListWidthPercentage * window.innerWidth) / 100,
                height: window.innerHeight,
                x: 0,
                y: 0
            }
            // Set the size of the board
            var boardSize = window.innerWidth - this._playerListMenuRect.width - this._pieceListMenuRect.width;
            if (boardSize > window.innerHeight)
                boardSize = window.innerHeight;
            this._boardSizeRect = {
                width: boardSize,
                height: boardSize,
                x: this._playerListMenuRect.width,
                y: 0
            };
            // Set the x position of the piece menu based on the board and player list position 
            this._pieceListMenuRect.x = this._playerListMenuRect.width + this._boardSizeRect.width + 50;
        }
        var startGameBtn = this._uis.find((ui) => { return (ui._text == "Start game"); });
        var quitBtn = this._uis.find((ui) => { return (ui._text == "Quit"); });
        if (this._pieceList)
            this._pieceList.resize(this._pieceListMenuRect);
        if (this._playerList)
            this._playerList.resize(this._playerListMenuRect);
        if (this._map && g_game)
            this._map.setGridSize();
        if (!this._ctx)
            return;
        this._ctx.canvas.width = window.innerWidth;
        this._ctx.canvas.height = window.innerHeight;
    }

    // init the canvas
    initCanvas() {
        // create the canvas
        this._canvas = document.createElement("canvas");

        // add the canvas to the body
        document.body.appendChild(this._canvas);
        // get the canvas context
        this._ctx = this._canvas.getContext("2d");
        // add an event listener on the canvas
        this._canvas.addEventListener("click", this.onClick.bind(this));
        this._canvas.addEventListener("mousemove", this.saveMousePos.bind(this));
        this.resize();
    }

    // init the game
    init() {
        // delete the login menu
        var loginMenu = document.getElementById("login-container");
        loginMenu.parentNode.removeChild(loginMenu);

        this.initCanvas();
        this._uis.push(new UiButton({
            x: this._playerListMenuRect.x,
            y: this._playerListMenuRect.y + this._playerListMenuRect.height - 60,
            width: this._playerListMenuRect.width,
            height: 50
        }, "red", "white", "Quit", () => { window.location.reload(); }));
    }

    login(username) {
        // authenticate
        this._socket.emit("login", { username: username });
        // ask for a list of room
        this._socket.emit("list-rooms");
    }

    startGame() {
        this._socket.emit("start-game");
    }

    joinRoom(roomId) {
        this._socket.emit("join-room", { roomId: roomId });
    }

    createRoom(roomName) {
        this._socket.emit("create-room", { roomName: roomName });
    }

    onPlayerInfo(info) {
        this._player = info;
        // add a start game btn if admin
        if (this._player.admin) {
            this._uis.push(new UiButton({
                x: this._playerListMenuRect.x,
                y: this._playerListMenuRect.y + this._playerListMenuRect.height - 120,
                width: this._playerListMenuRect.width,
                height: 50
            }, "green", "white", "Start game", this.startGame.bind(this)));
        }
    }

    onStartGameResponse(data) {
        if (data.error) {
            Notifications.error(data.error);
            return;
        }
        // hide the start button
        var startGameBtn = this._uis.find((ui) => { return (ui._text == "Start game"); });
        if (startGameBtn)
            startGameBtn.changeVisibility();
    }

    onJoinRoomResponse(data) {
        if (data.error) {
            Notifications.error(data.error);
            return;
        }
        this.run();
    }

    onCreateRoomResponse(data) {
        if (data.error) {
            Notifications.error(data.error);
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
        this._playerList.setPlayerList(playerList);
        // Search for the player in the list, and send a notification if it's his turn
        playerList.forEach((player) => {
            if (player.id == this._player.id && player.playTurn)
                Notifications.info("It's your turn to play !");
        });
    }

    onLoginResponse(data) {
        if (data.error) {
            Notifications.error(data.error);
            // reload window
            window.location.reload();
            return;
        }
        Notifications.success("You are logged in !");
        // on success, save the player data
        this._player = data;
        // hide the login button
        document.getElementById("login-btn").style.visibility = "hidden";
        document.getElementById("login-btn").style.position = "absolute";
        // Display the disconnect button
        document.getElementById("disconnect-btn").style.visibility = "visible";
        document.getElementById("disconnect-btn").style.position = "relative";
        document.getElementById("room-actions-container").style.visibility = "visible";
    }

    onMapReceived(map) {
        this._map = new Map(map);
        this._map.setGridSize();
    }

    onPiecePlaced(response) {
        if (response.success) {
            this._pieceList._selectedPiece = null;
        }
        else if (response.error) {
            Notifications.error(response.error);
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
        this.init();
        // setGridSize of the map
        this._map.setGridSize();
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
        // Set a background color for the board
        this._ctx.fillRect(this._boardSizeRect.x, this._boardSizeRect.y, this._boardSizeRect.width, this._boardSizeRect.height);
        // don't render the board or the PieceList until the player is connected
        if (!this._player)
            return;
        this._map.render();
        this._playerList.render();
        this._pieceList.render();
        this.renderSelectedPiece();
        // Render the ui
        this._uis.forEach((ui) => {
            ui.render();
        })
    }

    renderSelectedPiece() {
        const piece = this._pieceList._selectedPiece;

        if (!piece)
            return;
        var mousePosModified = { x: this._mousePos.x - this._map._gridSize.width / 2, y: this._mousePos.y - this._map._gridSize.height / 2 };
        // render the piece 
        this._pieceList.renderPiece(piece, mousePosModified, this._map._gridSize);
    }

    // clicks

    saveMousePos(event) {
        const click = { x: event.clientX, y: event.clientY };
        this._mousePos.x = click.x;
        this._mousePos.y = click.y;
    }

    // return true if the point is in the rectangle
    isPointInRect(point, rect) {
        return (point.x >= rect.x && point.x <= rect.x + rect.width
            && point.y >= rect.y && point.y <= rect.y + rect.height);
    }

    isClickOnBoard(click) {
        return (this.isPointInRect(click, this._boardSizeRect));
    }

    isClickOnPieceList(click) {
        return (this.isPointInRect(click, this._pieceListMenuRect));
    }

    onClick(event) {
        const click = { x: event.clientX, y: event.clientY };

        //        Notifications.info("click y: " + click.x + " y: " + click.y);
        // If the position are negative, set to 0
        if (click.x < 0)
            click.x = 0;
        if (click.y < 0)
            click.y = 0;

        this._uis.forEach((ui) => {
            if (this.isPointInRect(click, ui._positionRect))
                ui.onClick(click);
        });
        if (this.isClickOnBoard(click) && this._pieceList._selectedPiece) {
            const clickRelativeToBoard = { x: click.x - this._boardSizeRect.x, y: click.y - this._boardSizeRect.y };
            // if the place was correctly placed, delete the piece
            this._socket.emit("place-piece", {
                piece: this._pieceList._selectedPiece,
                position: { x: Math.floor(clickRelativeToBoard.x / this._map._gridSize.width), y: Math.floor(clickRelativeToBoard.y / this._map._gridSize.height) }
            });
        }
        else if (this.isClickOnPieceList(click))
            this._pieceList.selectPiece(click);
    }
}