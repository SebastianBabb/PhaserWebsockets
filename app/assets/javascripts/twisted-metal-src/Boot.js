// Create a TwistedMetal object.
TwistedMetal = { 
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

    /**
    *preload image until gae loads 
    *
    */
    preload: function () {
        this.load.image('preloaderBar', '/twisted-metal/preload.png');

    },
    /**
    *Create Window for JS window to display the game
    *
    */
    create: function () {
        this.input.maxPointers = 1;
        this.stage.disableVisibilityChange = true;
        //default game window
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
        //resize if necessary
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

    /**
    *check orientation of game
    *
    */
    enterIncorrectOrientation: function () {

        TwistedMetal.orientated = false;

        document.getElementById('orientation').style.display = 'block';

    },
    /**
    *
    */
    leaveIncorrectOrientation: function () {

        TwistedMetal.orientated = true;

        document.getElementById('orientation').style.display = 'none';

    }

};
