// Create TwistedMetal.Game prototype.
TwistedMetal.Game = function (game) {
    // Declare class variables.
    // this.client_id;

    this.game = game;

    this.land;  // Background.
    // TwistedMetal.clients[0] = TwistedMetal.clients[0];  
    TwistedMetal.clients = [];

    this.explosions;

    this.cursors;

    this.bullets;

    // Websocket configurations.
};

// Add functions to Game prototype.
TwistedMetal.Game.prototype = {
    // Assets loaded in Preloader: preload.

    // Create the game world.
	create: function () {
        console.log("Game: create");
        // Websocket onopen callback.  Executes once ws connection has been made.
        TwistedMetal.ws.onopen = function() {
            console.log("Websocket onopen");
            // TwistedMetal.ws.send("message sent!");
        }

        TwistedMetal.ws.onmessage = function(event) {
            console.log("message received: " + event.data);
            console.log("Tank Speed: " + TwistedMetal.clients[0].getSpeed());
            //var message = JSON.parse(event.data);
            //console.log("message: " + event.message);
        }

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
        // TwistedMetal.clients[0] = new Tank(101, this.game, this.bullets);
        TwistedMetal.clients.push(new Tank(101, this.game, this.bullets));
        // this.enemy = new EnemyTank(1, this.game, TwistedMetal.clients[0], this.enemyBullets);
 

        // Generate the bad guys.
        // for (var i = 0; i < this.enemiesTotal; i++)
        // {
        //     this.enemies.push(new EnemyTank(i, this.game, TwistedMetal.clients[0], this.enemyBullets));
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

        // this.game.camera.follow(TwistedMetal.clients[0]);

        this.game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
        this.game.camera.focusOnXY(0, 0);

        this.cursors = this.game.input.keyboard.createCursorKeys();

        // this.stage.smoothed = false;
        // this.game.input.onDown.add(this.gofull, this);
        // Websocket on connect handler.
       //  this.ws.onopen = function() {
       //      console.log("websocket connection opened");
       //      // $("#game").append("Connected...");
       //      // this.enemies.push(new EnemyTank(1, this.game, TwistedMetal.clients[0], this.enemyBullets));
       //      // TwistedMetal.clients[0] = new Tank(this.game, this.bullets);
       //  }




        
        //
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

        // this.game.physics.arcade.overlap(this.enemyBullets, TwistedMetal.clients[0], this.bulletHitPlayer, null, this);

        // this.enemiesAlive = 0;

        // for (var i = 0; i < this.enemies.length; i++)
        // {
        //     if (this.enemies[i].alive)
        //     {
        //         this.enemiesAlive++;
        //         this.game.physics.arcade.collide(TwistedMetal.clients[0], this.enemies[i].clients[0]);
        //         this.game.physics.arcade.overlap(this.bullets, this.enemies[i].clients[0], this.bulletHitEnemy, null, this);
        //         this.enemies[i].update
        //     }
        // }

        if (this.cursors.left.isDown)
        {
            TwistedMetal.clients[0].turnLeft();
            TwistedMetal.ws.send(TwistedMetal.clients[0].getID() + " is turning turning left");
        }
        else if (this.cursors.right.isDown)
        {
            TwistedMetal.clients[0].turnRight();
            TwistedMetal.ws.send("turning right");
        }

        if (this.cursors.up.isDown)
        {
            TwistedMetal.clients[0].moveForward();
        }
        else
        {
            if (TwistedMetal.clients[0].getSpeed() > 0)
            {
                //console.log("Current Speed:" + TwistedMetal.clients[0].getSpeed());
                TwistedMetal.clients[0].reduceSpeed();
            }
        }

        if (TwistedMetal.clients[0].getSpeed() > 0)
        {
            //console.log("update speed");
            // Set the tanks rotation, speed, and point.
            this.game.physics.arcade.velocityFromRotation(TwistedMetal.clients[0].rotation(), TwistedMetal.clients[0].getSpeed(), TwistedMetal.clients[0].velocity());
        }

        this.land.tilePosition.x = -this.game.camera.x;
        this.land.tilePosition.y = -this.game.camera.y;

        // Realign the tank parts.
        TwistedMetal.clients[0].realign();

        if (this.game.input.activePointer.isDown)
        {
            //  Boom!
            TwistedMetal.clients[0].fire();
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

    // Render debugging info for tank.
    render: function() {
        // game.debug.text('Active Bullets: ' + bullets.countLiving() + ' / ' + bullets.length, 32, 32);
        this.game.debug.text('X: ' + TwistedMetal.clients[0].getXPosition().toString().slice(0,6), 32, 32)
        this.game.debug.text('Y: ' + TwistedMetal.clients[0].getYPosition().toString().slice(0,6), 32, 64);
        this.game.debug.text('Angle: ' + TwistedMetal.clients[0].getAngle(), 32, 96);
        this.game.debug.text('Speed: ' + TwistedMetal.clients[0].getSpeed(), 32, 128);
        this.game.debug.text('Clients: ' + TwistedMetal.clients.length, 32, 160);
        this.game.debug.text('ID: ' + TwistedMetal.clients[0].getID(), 32, 192);
    }

};
