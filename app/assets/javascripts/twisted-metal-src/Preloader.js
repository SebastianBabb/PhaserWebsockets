TwistedMetal.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;
	this.ready = false;

};

TwistedMetal.Preloader.prototype = {
	// Load assets.
	preload: function () {
        console.log("Preloader: preload");
		this.preloadBar = this.add.sprite(120, 200, 'preloaderBar');
		this.load.setPreloadSprite(this.preloadBar);
		// this.load.image('titlepage', '/missile-command/title-page.png');
	    this.load.atlas('tank', '/twisted-metal/tanks.png', '/twisted-metal/tanks.json');
	    this.load.atlas('enemy', '/twisted-metal/enemy-tanks.png', '/twisted-metal/tanks.json');
	    this.load.image('logo', '/twisted-metal/logo.png');
	    this.load.image('lose', '/twisted-metal/lose_screen.png');
	    this.load.image('win', '/twisted-metal/win_screen.png');
	    this.load.image('bullet', '/twisted-metal/bullet.png');
	    this.load.image('earth', '/twisted-metal/earth.png');
	    this.load.spritesheet('kaboom', '/twisted-metal/explosion.png', 64, 64, 23);

	},

	create: function () {
        console.log("Preloader: create");
        // Connect to game websocket.
        console.log("Connecting to game websocket");
        //TwistedMetal.ws = new WebSocket(TwistedMetal.uri);
		this.preloadBar.cropEnabled = false;
		// Start the main menu.
        //console.log("Websocket readyState: " + TwistedMetal.ws.readyState);
		// this.state.start('MainMenu');

		// Wait for the socket to connect, then execute the callback to start the game.
		// this.waitForSocketConnection(TwistedMetal.ws, function() {
		// 	console.log("Connected to websocket.  Starting game.")
		// });
		this.state.start('Game');
	},

	update: function () {
		// if (this.cache.isSoundDecoded('titleMusic') && this.ready == false)
		// {
			// this.ready = true;
			// this.state.start('MainMenu');
		// }
	},

	// waitForSocketConnection: function(websocket, callback) {
	// 	// Try to connect every 5ms until successful.
	// 	setTimeout(
	// 		function() {
	// 			// Check socket connection.
	// 			if(websocket.readyState === 1) {
	// 				console.log("Connected to Websocket.");
	// 				if(callback != null) {
	// 					// Execute the callback.
	// 					callback();
	// 				}
	// 				// No callback, so just return.
	// 				return;
	// 			} else {
	// 				console.log("Waiting for socket connection");
	// 				// Call recursively.
	// 				waitForSocketConnection(websocket, callback);
	// 			}
	// 		}, 5);
	// }

};
