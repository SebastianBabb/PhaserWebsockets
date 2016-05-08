// Create TwistedMetal.Game prototype.
TwistedMetal.Game = function (game) {
    this.clients = new Object();  // Remotely connected clients ids.
    this.tank;

    const CREATE_CLIENT = 0;

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
    //this.ws = new WebSocket("wss://aqueous-ridge-40988.herokuapp.com/game");

    // Websocket onopen event handler. 
    this.ws.addEventListener("open", function(event) {
        // Log connection status.
        console.log("Connected to game websocket.  Starting game...");
    });

    // Websocket on message recieved event handler. 
    this.ws.addEventListener("message", function(event) {
        // Log the message.
        console.log("message: " + event.data);

        // Parse the message json.
        message = JSON.parse(event.data)

        // If the message action is CREATE_CLIENT (value 0), then
        // toggle the create client flag to true.
        if(message.action == CREATE_CLIENT) {
            this.create_client = true;
        }
        
        // Push the message sent from the server to message queue.
        this.message_queue.push(message);

    }.bind(this)); // Allows callback this scope.
};

// Add functions to Game prototype.
TwistedMetal.Game.prototype = {
    // Assets loaded in Preloader: preload.

    // Create the game world.
	create: function () {
        // Log status.
        console.log("Game: create");

        //  Resize the game world to be a 2000 x 2000 square
        this.game.world.setBounds(-1000, -1000, 2000, 2000);

        // Full screen - priority 3
        // this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

        // Tiled scrolling background
        this.land = this.game.add.tileSprite(0, 0, 800, 600, 'earth');
        this.land.fixedToCamera = true;

        // Generate tank ammo. 
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
            console.log("create client");
            // Ensure that the queue is not empty.
            if(0 < this.message_queue.length) {
                // Get the server message from the queue.
                new_tank = this.message_queue.shift();

                // Create the tank with set camera follow true - last param.
                var x = 50;
                var y = 50;
                var speed = 0;
                var angle = 90;
                var health = 3;
                var follow = true;
                this.tank = new Tank(new_tank.id, x, y, angle, speed, health, follow, this.game, this.bullets);
                this.clients[this.tank.id] = this.tank;
                this.create_client = false;
                
                // Log status.
                console.log("CREATING CLIENT: " + new_tank.id);
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

        this.game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
        this.game.camera.focusOnXY(0, 0);

        // Set curosor.
        this.cursors = this.game.input.keyboard.createCursorKeys();
	},     

    // removeLogo: function() {
    //     this.game.input.onDown.remove(this.removeLogo, this);
    //     this.logo.kill();

    // },

    // Update the client.  This is where all of the tanks will be updated.
    // There are three possible actions - add a remote client to the game
    // space, update an existing tank in the game space, and remove an
    // existing tank from the game space.  Which action to perform is
    // specified by in the message recieved by from the server.
	update: function () {
        console.log("update");
        // Ensure that the queue is not empty.
        if(0 < this.message_queue.length) {
            // Determine which action to perform.
            switch(this.message_queue[0].action) {
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
        }

        // Add a new client.
        if(this.add_client) {
            // Check that there are message to process.
            if(0 < this.message_queue.length) {
                // Get the message from the head of the queue.
                add_tank = this.message_queue.shift();

                // Create and add the tank to the tank hash.
                var x = -100;
                var y = -100;
                var speed = 0;
                var angle = 0;
                var health = 3;
                var follow = false;
                this.clients[add_tank.id] = new Tank(add_tank.id, x, y, angle, speed, health, follow, this.game, this.bullets);

                // Toggle flag back to false.
                this.add_client = false;

                // Log event.
                console.log("ADDING CLIENT: " + add_tank.id);
                console.log("ADD_CLIENT = FALSE");
            }
        }
        
        // Add a new client.
        if(this.update_client) {
            // Check that there are message to process.
            if(0 < this.message_queue.length) {
                // Log event.
                console.log("UPDATING CLIENT");
                // Update values.
                tank_update = this.message_queue.shift();

                // Tank to update.
                tank = this.clients[tank_update.id];
                tank.setAngle(tank_update.angle);
                tank.setSpeed(tank_update.speed);

                //console.log(tank);
                //console.log("getSpeed(): " + tank.getSpeed());

                // Process update.
                //var tank_update = this.message_queue.shift();
                
                console.log("id: " + tank.id);
                console.log("x_pos: " + tank.x_pos);
                console.log("y_pos: " + tank.y_pos);
                console.log("angle: " + tank.angle);
                console.log("speed: " + tank.speed;
                console.log("health: " + tank.health);

                console.log("rotation: " + tank.getRotation());
                console.log("velocity: " + tank.getVelocity());
                //for(var param in tank_update) {
                    //if(tank[param] != tank_update[param]) {
                        ////console.log(tank[param] + "!= " + tank_update[param]);
                        //tank[param] = tank_update[param];
                    //}
                //}


                // Update the physics.
                // Set the tanks rotation, speed, and point.
                this.game.physics.arcade.velocityFromRotation(tank.getRotation(),
                                                              tank.getSpeed(),
                                                              tank.getVelocity());

                tank.realign();
                // Toggle flag back to false.
                this.update_client = false;
            }
        }

        // Delete a client.
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

        // Setup the cursor - what buttons make the tank do what.
        if (this.cursors.left.isDown)
        {
            this.tank.turnLeft();
            // Send the tanks instance as a json to the server.
            this.ws.send(this.tank.jsonify());
       }
        else if (this.cursors.right.isDown)
        {
            this.tank.turnRight();
            // Send the tanks instance as a json to the server.
            this.ws.send(this.tank.jsonify());
        }

        if (this.cursors.up.isDown)
        {
            this.tank.moveForward();
            // Send the tanks instance as a json to the server.
            this.ws.send(this.tank.jsonify());
        }
        else
        {
            if (this.tank.getSpeed() > 0)
            {
                //console.log("Current Speed:" + this.tank.getSpeed());
                this.tank.reduceSpeed();
                // Send the tanks instance as a json to the server.
                this.ws.send(this.tank.jsonify());
            }
        }

        if (this.tank.getSpeed() > 0)
        {
            //console.log("update speed");
            // Set the tanks rotation, speed, and point.
            this.game.physics.arcade.velocityFromRotation(this.tank.getRotation(), this.tank.getSpeed(), this.tank.getVelocity());

            // Send the tanks instance as a json to the server.
            //this.ws.send(this.tank.jsonify());
        }

        this.land.tilePosition.x = -this.game.camera.x;
        this.land.tilePosition.y = -this.game.camera.y;

        // Realign the tank parts.
        this.tank.realign();

        if (this.game.input.activePointer.isDown)
        {
            //  Boom!
            this.tank.fire();
                // Send the tanks instance as a json to the server.
                this.ws.send(this.tank.jsonify());
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
        if(this.tank != null) {
            // game.debug.text('Active Bullets: ' + bullets.countLiving() + ' / ' + bullets.length, 32, 32);
            this.game.debug.text('X: ' + this.tank.getXPosition().toString().slice(0,6), 32, 32)
            this.game.debug.text('Y: ' + this.tank.getYPosition().toString().slice(0,6), 32, 64);
            this.game.debug.text('Angle: ' + this.tank.getAngle(), 32, 96);
            this.game.debug.text('Speed: ' + this.tank.getSpeed(), 32, 128);
            this.game.debug.text('Tank ID: ' + this.tank.id, 32, 160);
            this.game.debug.text('Clients: ' + Object.keys(this.clients).length, 32, 192);
        }
    },
};
