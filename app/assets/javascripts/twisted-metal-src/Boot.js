// Create a TwistedMetal object.
TwistedMetal = { 

    /* Here we've just got some global level vars that persist regardless of State swaps */
    // score: 0,

    /* If the music in your game needs to play through-out a few State swaps, then you could reference it here */
    // music: null,

    /* Your game can check TwistedMetal.orientated in internal loops to know if it should pause or not */
    // orientated: false,

    // Game websocket
    // scheme: 'ws://',
    // Ensure the socket uri has /game appended to it so the proper middleware is loaded.
    //uri: 'wss://\' + window.document.location.host + '/game',

    //tank: null,

    // Current games running.
    arenas: null,

    // Clients connected to the game socket - number of tanks battling.
    game: null,

    bullets: null
};

// Add boot function to Twistedetal object and pass it an instance of game.
TwistedMetal.Boot = function (game) {
};

// Add preload and create functions.
TwistedMetal.Boot.prototype = {

    preload: function () {
        console.log("Boot: preload");
        this.load.image('preloaderBar', '/twisted-metal/preload.png');

    },

    create: function () {
        console.log("Boot: create");
        this.input.maxPointers = 1;
        this.stage.disableVisibilityChange = true;

        if (this.game.device.desktop)
        {
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.minWidth = 320;
            this.scale.minHeight = 240;
            this.scale.maxWidth = 800;
            this.scale.maxHeight = 600;
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
            this.scale.updateLayout(true);
        }
        else
        {
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.minWidth = 480;
            this.scale.minHeight = 260;
            this.scale.maxWidth = 1024;
            this.scale.maxHeight = 768;
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
            this.scale.forceOrientation(true, false);
            this.scale.setResizeCallback(this.gameResized, this);
            this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
            this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
            this.scale.updateLayout(true);
        }

        // Start the preloader.
        this.state.start('Preloader');

    },

    gameResized: function (width, height) {
    },

    enterIncorrectOrientation: function () {

        TwistedMetal.orientated = false;

        document.getElementById('orientation').style.display = 'block';

    },

    leaveIncorrectOrientation: function () {

        TwistedMetal.orientated = true;

        document.getElementById('orientation').style.display = 'none';

    }

};
