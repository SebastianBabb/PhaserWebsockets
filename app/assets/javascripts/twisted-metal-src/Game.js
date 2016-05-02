// Create TwistedMetal.Game prototype.
TwistedMetal.Game = function (game) {
    this.game = game;

    this.land;  // Background.
    this.tank;  

    this.explosions;

    this.cursors;

    this.bullets;

    // Websocket configurations.
    this.scheme = "ws://";
    // Ensure the socket uri has /game appended to it so the proper middleware is loaded.
    this.uri = this.scheme + window.document.location.host + "/game";
    this.ws;
};

// Add functions to Game prototype.
TwistedMetal.Game.prototype = {

	create: function () {
        console.log("Game.js");
        // Create a websocket object.
        // this.ws = new WebSocket(this.uri);

        //  Resize our game world to be a 2000 x 2000 square
        this.game.world.setBounds(-1000, -1000, 2000, 2000);

        // this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;


        //  Our tiled scrolling background
        this.land = this.game.add.tileSprite(0, 0, 800, 600, 'earth');
        this.land.fixedToCamera = true;

        // Generate some ammo for the tank. 
        this.bullets = this.game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.createMultiple(30, 'bullet', 0, false);
        this.bullets.setAll('anchor.x', 0.5);
        this.bullets.setAll('anchor.y', 0.5);
        this.bullets.setAll('outOfBoundsKill', true);
        this.bullets.setAll('checkWorldBounds', true);

        // Create the tank.
        this.tank = new Tank(this.game, this.bullets);
        // this.enemy = new EnemyTank(1, this.game, this.tank, this.enemyBullets);
 

        // Generate the bad guys.
        // for (var i = 0; i < this.enemiesTotal; i++)
        // {
        //     this.enemies.push(new EnemyTank(i, this.game, this.tank, this.enemyBullets));
        // }


        //  Explosion pool
        // this.explosions = this.game.add.group();

        // for (var i = 0; i < 10; i++)
        // {
        //     var explosionAnimation = this.explosions.create(0, 0, 'kaboom', [0], false);
        //     explosionAnimation.anchor.setTo(0.5, 0.5);
        //     explosionAnimation.animations.add('kaboom');
        // }

        // this.logo = this.game.add.sprite(0, 200, 'logo');
        // this.logo.fixedToCamera = true;

        // this.game.input.onDown.add(this.removeLogo, this);

        // this.game.camera.follow(this.tank);

        this.game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
        this.game.camera.focusOnXY(0, 0);

        this.cursors = this.game.input.keyboard.createCursorKeys();

        // this.stage.smoothed = false;
        // this.game.input.onDown.add(this.gofull, this);
        // Websocket on connect handler.
       //  this.ws.onopen = function() {
       //      console.log("websocket connection opened");
       //      // $("#game").append("Connected...");
       //      // this.enemies.push(new EnemyTank(1, this.game, this.tank, this.enemyBullets));
       //      // this.tank = new Tank(this.game, this.bullets);
       //  }



       //  this.ws.onmessage = function(event) {
       //      console.log("event received");
       //      var message = JSON.parse(event.data);
       //      console.log("message: " + event.message);
       //      // $("#game").append("Connected...");
       //      // this.enemies.push(new EnemyTank(1, this.game, this.tank, this.enemyBullets));
       //      // this.tank = new Tank(this.game, this.bullets);
       //  }

       // this.ws.send(JSON.stringify({message: "hello"}));
	},     

    // gofull: function() {

    //     if (this.game.scale.isFullScreen)
    //     {
    //         this.game.scale.stopFullScreen();
    //     }
    //     else
    //     {
    //         this.game.scale.startFullScreen(false);
    //     }

    // },

    // removeLogo: function() {
    //     this.game.input.onDown.remove(this.removeLogo, this);
    //     this.logo.kill();

    // },

	update: function () {

        // this.game.physics.arcade.overlap(this.enemyBullets, this.tank, this.bulletHitPlayer, null, this);

        // this.enemiesAlive = 0;

        // for (var i = 0; i < this.enemies.length; i++)
        // {
        //     if (this.enemies[i].alive)
        //     {
        //         this.enemiesAlive++;
        //         this.game.physics.arcade.collide(this.tank, this.enemies[i].tank);
        //         this.game.physics.arcade.overlap(this.bullets, this.enemies[i].tank, this.bulletHitEnemy, null, this);
        //         this.enemies[i].update
        //     }
        // }

        if (this.cursors.left.isDown)
        {
            this.tank.turnLeft();
        }
        else if (this.cursors.right.isDown)
        {
            this.tank.turnRight();
        }

        if (this.cursors.up.isDown)
        {
            this.tank.moveForward();
        }
        else
        {
            if (this.tank.getSpeed() > 0)
            {
                console.log("Current Speed:" + this.tank.getSpeed());
                this.tank.reduceSpeed();
            }
        }

        if (this.tank.getSpeed() > 0)
        {
            console.log("update speed");
            // Set the tanks rotation, speed, and point.
            this.game.physics.arcade.velocityFromRotation(this.tank.rotation(), this.tank.getSpeed(), this.tank.velocity());
        }

        this.land.tilePosition.x = -this.game.camera.x;
        this.land.tilePosition.y = -this.game.camera.y;

        // Realign the tank parts.
        this.tank.realign();

        if (this.game.input.activePointer.isDown)
        {
            //  Boom!
            this.tank.fire();
        }
	},


	quitGame: function () {

		this.state.start('MainMenu');

	},

    bulletHitPlayer: function(tank, bullet) {

        bullet.kill();

    },

    bulletHitEnemy: function(tank, bullet) {

        bullet.kill();

        var destroyed = this.enemies[tank.name].damage();

        if (destroyed)
        {
            var explosionAnimation = this.explosions.getFirstExists(false);
            explosionAnimation.reset(tank.x, tank.y);
            explosionAnimation.play('kaboom', 30, false, true);
        }

    },


    render: function() {

        // game.debug.text('Active Bullets: ' + bullets.countLiving() + ' / ' + bullets.length, 32, 32);
        this.game.debug.text('Enemies: ' + this.enemiesAlive + ' / ' + this.enemiesTotal, 32, 32);

    }

};
