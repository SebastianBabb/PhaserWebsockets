TwistedMetal.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;

	this.ready = false;

};

TwistedMetal.Preloader.prototype = {
	// Load assets.
	preload: function () {
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

		this.preloadBar.cropEnabled = false;

		console.log("in create");
		// Start the main menu.
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
