class Game {
    constructor() {
        // init rects
        this._pieceListMenuRect = { x: 0, y: 0, height: 0, width: 0 };
        this._playerListMenuRect = { x: 0, y: 0, height: 0, width: 0 };
        this._boardSizeRect = { x: 0, y: 0, height: 0, width: 0 };
        // generate the map
        this._map = new Map();
        // The player
        this._player = null;
        // UI elements
        this._quitBtn = null;
        this._startBtn = null;
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
        // on rotate response
        this._socket.on("rotate-piece:response", this.onRotateResponse.bind(this));
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
        if (!this._ctx)
            return;
        const leftMarginPercentage = 5;
        const topMarginPercentage = 10;
        this._ctx.canvas.width = window.innerWidth - ((leftMarginPercentage * window.innerWidth) / 100);
        this._canvas.style.marginLeft = (((leftMarginPercentage * window.innerWidth) / 100) / 2) + "px";
        this._canvas.style.marginTop = (((topMarginPercentage * window.innerHeight) / 100) / 2) + "px";
        this._ctx.canvas.height = window.innerHeight - ((topMarginPercentage * window.innerHeight) / 100);
        // Resize for small screens
        if (this.isSmallScreen()) {
            const bottomMenuHeightPercentage = 20;
            const playerListWidthPercentage = 20;
            const bottomMenuHeight = (bottomMenuHeightPercentage * this._ctx.canvas.height) / 100;
            // Set the size of the board (full width on small screens)
            this._boardSizeRect = {
                width: this._ctx.canvas.height - bottomMenuHeight,
                height: this._ctx.canvas.height - bottomMenuHeight,
                x: (this._ctx.canvas.width / 2) - (this._ctx.canvas.height - bottomMenuHeight) / 2,
                y: 0
            };
            if (this._boardSizeRect.x < 0)
                this._boardSizeRect.x = 0;
            if (this._boardSizeRect.x + this._boardSizeRect.width >= this._ctx.canvas.width) {
                this._boardSizeRect.width = this._ctx.canvas.width;
                this._boardSizeRect.height = this._ctx.canvas.width;
            }
            // Set the size of the player list
            this._playerListMenuRect = {
                width: (playerListWidthPercentage * this._ctx.canvas.width) / 100,
                height: bottomMenuHeight,
                x: 0,
                y: this._boardSizeRect.height
            };
            // Set the size of the piece list
            this._pieceListMenuRect = {
                width: this._ctx.canvas.width - this._playerListMenuRect.width,
                height: bottomMenuHeight,
                x: this._playerListMenuRect.width,
                y: this._boardSizeRect.height
            }
            // Resize the buttons
            if (this._quitBtn)
                this._quitBtn.resize({
                    x: this._playerListMenuRect.x,
                    y: this._playerListMenuRect.y + this._playerListMenuRect.height - 30,
                    width: this._playerListMenuRect.width,
                    height: 25
                });
            if (this._startBtn) {
                this._startBtn.resize({
                    x: this._playerListMenuRect.x,
                    y: this._playerListMenuRect.y + this._playerListMenuRect.height - 60,
                    width: this._playerListMenuRect.width,
                    height: 25
                });
            }

        }
        // Big screens
        else {
            const playerListWidthPercentage = 10;
            const pieceListWidthPercentage = 20;
            // Set the size of the player list
            this._playerListMenuRect = {
                width: (playerListWidthPercentage * this._ctx.canvas.width) / 100,
                height: this._ctx.canvas.height,
                x: 0,
                y: 0
            };
            // Set the size of the piece list
            this._pieceListMenuRect = {
                width: (pieceListWidthPercentage * this._ctx.canvas.width) / 100,
                height: this._ctx.canvas.height,
                x: 0,
                y: 0
            }
            // Set the size of the board
            var boardSize = this._ctx.canvas.width - this._playerListMenuRect.width - this._pieceListMenuRect.width;
            if (boardSize > this._ctx.canvas.height)
                boardSize = this._ctx.canvas.height;
            this._boardSizeRect = {
                width: boardSize,
                height: boardSize,
                x: (this._ctx.canvas.width / 2) - (boardSize / 2),
                y: 0
            };
            // Set the x position of the piece menu based on the board and player list position 
            this._pieceListMenuRect.x = this._ctx.canvas.width - this._pieceListMenuRect.width;
            if (this._pieceListMenuRect.x < this._boardSizeRect.x + this._boardSizeRect.width) {
                this._pieceListMenuRect.x = this._boardSizeRect.x + this._boardSizeRect.width;
            }
            // Resize the buttons
            if (this._quitBtn)
                this._quitBtn.resize({
                    x: this._playerListMenuRect.x,
                    y: this._playerListMenuRect.y + this._playerListMenuRect.height - 60,
                    width: this._playerListMenuRect.width,
                    height: 50
                });
            if (this._startBtn) {
                this._startBtn.resize({
                    x: this._playerListMenuRect.x,
                    y: this._playerListMenuRect.y + this._playerListMenuRect.height - 120,
                    width: this._playerListMenuRect.width,
                    height: 50
                });
            }
        }
        if (this._pieceList)
            this._pieceList.resize(this._pieceListMenuRect);
        if (this._playerList)
            this._playerList.resize(this._playerListMenuRect);
        if (this._map)
            this._map.resize(this._boardSizeRect);
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
        this._canvas.addEventListener("wheel", this.onWheel.bind(this));
        this.resize();
    }

    // init the game
    init() {
        // delete the login menu
        var loginMenu = document.getElementById("login-container");
        loginMenu.parentNode.removeChild(loginMenu);

        // hide the overflow
        document.body.style.overflow = "hidden";

        this.initCanvas();
        this._quitBtn = new UiButton({
            x: this._playerListMenuRect.x,
            y: this._playerListMenuRect.y + this._playerListMenuRect.height - (this.isSmallScreen() ? 30 : 60),
            width: this._playerListMenuRect.width,
            height: (this.isSmallScreen() ? 25 : 50)
        }, "#dc3545", "white", "Quit", () => { window.location.reload(); });
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

    onRotateResponse(data) {
        if (data.error) {
            Notifications.error(data.error);
            return;
        }
        // get the rotated piece
        this._pieceList._selectedPiece = data.piece;
    }

    onPlayerInfo(info) {
        this._player = info;
        // add a start game btn if admin
        if (this._player.admin) {
            this._startBtn = new UiButton({
                x: this._playerListMenuRect.x,
                y: this._playerListMenuRect.y + this._playerListMenuRect.height - 60,
                width: this._playerListMenuRect.width,
                height: 25
            }, "#007bff", "white", "Start game", this.startGame.bind(this));
        }
    }

    onStartGameResponse(data) {
        if (data.error) {
            Notifications.error(data.error);
            return;
        }
        // hide the start button
        if (this._startBtn)
            this._startBtn = null;
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
                Notifications.info("It's your turn to play !", 1500);
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
        this._map.resize(this._boardSizeRect);
    }

    onPiecePlaced(response) {
        if (response.success) {
            this._pieceList._selectedPiece = null;
        }
        else if (response.error) {
            Notifications.error(response.error, 1500);
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
        this._map.resize(this._boardSizeRect);
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
        // don't render the board or the PieceList until the player is connected
        if (!this._player)
            return;
        this._map.render();
        this._playerList.render();
        this._pieceList.render();
        this.renderSelectedPiece();

        if (this._startBtn)
            this._startBtn.render();
        if (this._quitBtn)
            this._quitBtn.render();
    }

    renderSelectedPiece() {
        const piece = this._pieceList._selectedPiece;

        if (!piece)
            return;
        // find the part of the piece that is the closer to the top left corner
        var mousePosModified = {
            x: this._mousePos.x - (piece._topLeftCorner.x * this._map._gridSize.width),
            y: this._mousePos.y - (piece._topLeftCorner.y * this._map._gridSize.height)
        };
        // render the piece 
        this._pieceList.renderPiece(piece, mousePosModified, this._map._gridSize);
    }

    // clicks

    setPointerCursor() {
        g_game._canvas.style.cursor = "pointer";
    }

    setDefaultCursor() {
        g_game._canvas.style.cursor = "auto";
    }

    saveMousePos(event) {
        const click = this.getClickPosRelativeToCanvas(event);
        this._mousePos.x = click.x;
        this._mousePos.y = click.y;
        if (this._quitBtn) {
            var hovered = this.isPointInRect(click, this._quitBtn._positionRect);
            // if the button is no more hovered
            if (this._quitBtn._hovered && !hovered)
                this._quitBtn.onHoverOut(click);
            // if the button is hovered
            else if (hovered)
                this._quitBtn.onHover(click);
        }
        if (this._startBtn) {
            var hovered = this.isPointInRect(click, this._startBtn._positionRect);
            // if the button is no more hovered
            if (this._startBtn._hovered && !hovered)
                this._startBtn.onHoverOut(click);
            // if the button is hovered
            else if (hovered)
                this._startBtn.onHover(click);
        }
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

    onWheel(event) {
        if (!this._pieceList._selectedPiece)
            return;
        const pieceId = this._pieceList._selectedPiece._id;
        if (event.deltaY > 0) {
            this._socket.emit("rotate-piece", {
                pieceId: pieceId, orientation: 1
            });
        }
        else {
            this._socket.emit("rotate-piece", {
                pieceId: pieceId, orientation: -1
            });
        }
    }

    getClickPosRelativeToCanvas(event) {
        return ({ x: event.clientX - parseInt(this._canvas.style.marginLeft), y: event.clientY - parseInt(this._canvas.style.marginTop) });
    }

    onClick(event) {
        const click = this.getClickPosRelativeToCanvas(event);

        // If the position are negative, set to 0
        if (click.x < 0)
            click.x = 0;
        if (click.y < 0)
            click.y = 0;

        // if the click is on a button
        if (this._quitBtn && this.isPointInRect(click, this._quitBtn._positionRect))
            return this._quitBtn.onClick(click);
        if (this._startBtn && this.isPointInRect(click, this._startBtn._positionRect))
            return this._startBtn.onClick(click);

        if (this.isClickOnBoard(click) && this._pieceList._selectedPiece) {
            var piece = this._pieceList._selectedPiece;
            const clickRelativeToBoard = {
                x: click.x - this._boardSizeRect.x - (piece._topLeftCorner.x * this._map._gridSize.width),
                y: click.y - this._boardSizeRect.y - (piece._topLeftCorner.y * this._map._gridSize.height)
            };
            // if the place was correctly placed, delete the piece
            this._socket.emit("place-piece", {
                pieceId: this._pieceList._selectedPiece._id,
                position: { x: Math.floor(clickRelativeToBoard.x / this._map._gridSize.width), y: Math.floor(clickRelativeToBoard.y / this._map._gridSize.height) }
            });
        }
        else if (this.isClickOnPieceList(click))
            this._pieceList.selectPiece(click);
    }
}