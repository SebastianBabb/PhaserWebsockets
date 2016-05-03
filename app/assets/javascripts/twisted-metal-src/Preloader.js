TwistedMetal.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;
	this.ready = false;

};

TwistedMetal.Preloader.prototype = {
	// Load assets.
	preload: function () {
        console.log("Preloader: preload");
		this.preloadBar = this.add.sprite(120, 200, '/twisted-metal/preloaderBar');
		this.load.setPreloadSprite(this.preloadBar);
		// this.load.image('titlepage', '/missile-command/title-page.png');
	    this.load.atlas('tank', '/twisted-metal/tanks.png', '/twisted-metal/tanks.json');
	    this.load.atlas('enemy', '/twisted-metal/enemy-tanks.png', '/twisted-metal/tanks.json');
	    this.load.image('logo', '/twisted-metal/logo.png');
	    this.load.image('bullet', '/twisted-metal/bullet.png');
	    this.load.image('earth', '/twisted-metal/earth.png');
	    this.load.spritesheet('kaboom', '/twisted-metal/explosion.png', 64, 64, 23);

	},

	create: function () {
        console.log("Preloader: create");
        // Connect to game websocket.
        console.log("Connecting to game websocket");
        TwistedMetal.ws = new WebSocket(TwistedMetal.uri);
		this.preloadBar.cropEnabled = false;
		// Start the main menu.
        console.log("Websocket readyState: " + TwistedMetal.ws.readyState);
		// this.state.start('MainMenu');
		this.state.start('Game');
	},

	update: function () {
		// if (this.cache.isSoundDecoded('titleMusic') && this.ready == false)
		// {
			// this.ready = true;
			// this.state.start('MainMenu');
		// }
	}

};
