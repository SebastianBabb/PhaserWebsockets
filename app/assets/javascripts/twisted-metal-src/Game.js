// Create TwistedMetal.Game prototype.
TwistedMetal.Game = function (game) {
    this.clients = new Object();  // Remotely connected clients ids.
    this.tank;

    this.create_client = false;
    this.add_client = false;
    this.update_client = false;
    this.delete_client = false;

    this.game = game;

    this.land;  // Background.

    this.explosions;

    this.cursors;

    this.bullets;

    this.message_queue = []; // Holds messages sent from the server in the order recieved.

    this.ws = new WebSocket(TwistedMetal.uri);

    // Implemenf(this.create_client) {
    //                     this.add_client = true;    
    //                                         this.create_client = false;
    //                                                         } else {
    //                                                                             this.create_client = true;
    //                                                                                             }
    //                                                                                                             // Race condition fix.
    //
    //                                                         }
    // }t websocket callback. onopen, onmessage...
    this.ws.addEventListener("open", function(event) {
        // Initial connection has been made.
        console.log("Connected to game websocket.  Starting game...");
    });

    this.ws.addEventListener("message", function(event) {
        // Parse the incoming JSON.
        console.log("message: " + event.data);
        // Push the message sent from the server to message queue.
        this.message_queue.push(JSON.parse(event.data));
        // Check json action parameter (CREATE_CLIENT, UPDATE_CLIENT, DELETE_CLIENT)
        // of the first message in the message queue.
        switch(this.message_queue[0].action) {
            case 0:
                // CREATE_CLIENT
                console.log("CREATE_CLIENT = TRUE");
                this.create_client = true;
                break;
            case 1:
                // ADD CLIENT
                console.log("ADD_CLIENT = TRUE");
                this.add_client = true;
                break;
            case 2:
                // UPDATE CLIENT
                console.log("UPDATE_CLIENT = TRUE");
                this.update_client = true;
                break;
            case 3:
                // DELETE CLIENT
                console.log("DELETE_CLIENT = TRUE");
                this.delete_client = true;
                break;
        } 
        //if(0 < Object.keys(this.clients).length && this.clients[this.message_queue.id] == null){
            //// Check 
            //// Clients did not have a record of this client. Add it.

            //this.add_tank = true; // Mark add tank to true so update will creat the new tank object.
            //// Iterate over the json object.
            ////for(var key in this.tank) {
                ////console.log(key + ": " + this.tank[key]);
            ////}
            ////this.clients.push(new Tank(this.tank.id, this.game, this.bullets));
        //}

        // Process the json.
        //console.log("id: " + this.tank.id);
        //console.log("speed: " + message.speed);
        //console.log("turret_angle: " + message.turret_angle);
        //console.log("x_position: " + message.x_position);
        //console.log("y_position: " + message.y_position);
        //console.log("health: " + message.health);
    }.bind(this)); // Allows callback this scope.
    

    // Websocket configurations.
};

// Add functions to Game prototype.
TwistedMetal.Game.prototype = {
    // Assets loaded in Preloader: preload.

    // Create the game world.
	create: function () {
        console.log("Game: create");

        //this.client_id = this.message_queue.id;

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
        
        // Create the user's tank.
        if(this.create_client) {
            if(0 < this.message_queue.length) {
                // Get the server message from the queue.
                new_tank = this.message_queue.shift();
                console.log("CREATING CLIENT: " + new_tank.id);
                // Create the tank with set camera follow true - last param.
                this.tank = new Tank(new_tank.id, this.game, this.bullets, true);
                this.clients[this.tank.id] = this.tank;
                this.create_client = false;
            }    
        }


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

	},     

    // removeLogo: function() {
    //     this.game.input.onDown.remove(this.removeLogo, this);
    //     this.logo.kill();

    // },

    // Update client.
	update: function () {
        // Add a new client.
        if(this.add_client) {
            // Check that there are message to process.
            if(0 < this.message_queue.length) {
                // Get the message from the head of the queue.
                add_tank = this.message_queue.shift();

                // Create and add the tank to the tank hash.
                this.clients[add_tank.id] = new Tank(add_tank.id, this.game, this.bullets, false);

                // Toggle flag back to false.
                this.add_client = false;

                // Log event.
                console.log("ADDING CLIENT: " + add_tank.id);
                console.log("ADD_CLIENT = FALSE");
            }
        }

        // Delete client.
        if(this.delete_client) {
            // Check that there are message to process.
            if(0 < this.message_queue.length) {
                // Get the message from the head of the queue.
                delete_tank = this.message_queue.shift();

                // Remove the tank sprite from game play.
                this.clients[delete_tank.id].remove();
                
                // Delete the tank from the tanks hash.
                delete this.clients[delete_tank.id];

                // Toggle flag back to false.
                this.delete_client = false;

                // Log event.
                console.log("DELETING CLIENT: " + delete_tank.id);
            }   
        }

        // this.game.physics.arcade.overlap(this.enemyBullets, this.tank, this.bulletHitPlayer, null, this);

        // this.enemiesAlive = 0;

        // for (var i = 0; i < this.enemies.length; i++)
        // {
        //     if (this.enemies[i].alive)
        //     {
        //         this.enemiesAlive++;
        //         this.game.physics.arcade.collide(this.tank, this.enemies[i].clients[0]);
        //         this.game.physics.arcade.overlap(this.bullets, this.enemies[i].clients[0], this.bulletHitEnemy, null, this);
        //         this.enemies[i].update
        //     }
        // }

        // Cursor.
        if (this.cursors.left.isDown)
        {
            this.tank.turnLeft();
            this.ws.send(this.tank.getID() + " "
             + this.tank.getAngle() + " "
             + this.tank.getSpeed() + " "
             + this.tank.getXPosition() + " "
             + this.tank.getYPosition());
        }
        else if (this.cursors.right.isDown)
        {
            this.tank.turnRight();
            this.ws.send(this.tank.getID() + " "
             + this.tank.getAngle() + " "
             + this.tank.getSpeed() + " "
             + this.tank.getXPosition() + " "
             + this.tank.getYPosition());
        }

        if (this.cursors.up.isDown)
        {
            this.tank.moveForward();
            this.ws.send(this.tank.getID() + " "
             + this.tank.getAngle() + " "
             + this.tank.getSpeed() + " "
             + this.tank.getXPosition() + " "
             + this.tank.getYPosition());
        }
        else
        {
            if (this.tank.getSpeed() > 0)
            {
                //console.log("Current Speed:" + this.tank.getSpeed());
                this.tank.reduceSpeed();
            }
        }

        if (this.tank.getSpeed() > 0)
        {
            //console.log("update speed");
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
            this.ws.send(this.tank.getID() + " "
             + this.tank.getAngle() + " "
             + this.tank.getSpeed() + " "
             + this.tank.getXPosition() + " "
             + this.tank.getYPosition());
        }
	},


	quitGame: function () {

		this.state.start('MainMenu');
        this.clients[this.client_id] = null;

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
        this.game.debug.text('X: ' + this.tank.getXPosition().toString().slice(0,6), 32, 32)
        this.game.debug.text('Y: ' + this.tank.getYPosition().toString().slice(0,6), 32, 64);
        this.game.debug.text('Angle: ' + this.tank.getAngle(), 32, 96);
        this.game.debug.text('Speed: ' + this.tank.getSpeed(), 32, 128);
        this.game.debug.text('Tank ID: ' + this.tank.id, 32, 160);
        this.game.debug.text('Clients: ' + Object.keys(this.clients).length, 32, 192);
    },
};
