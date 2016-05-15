// Create TwistedMetal.Game prototype.
TwistedMetal.Game = function (game) {
    const CREATE_CLIENT = 0;

    // Game duration - 2 minutes. 
    const GAME_DURATION = 1000 * 120;
    // Respawn duration - 3 seconds.
    const RESPAWN_DURATION = 1000 * 3;

    // Flags.
    this.create_client = false;
    this.add_client = false;
    this.update_client = false;
    this.delete_client = false;

    // Currently connected clients.
    this.clients = new Object();  
    // Store the defeated so they cant rejoin on going games by reloading.
    this.defeated = [];

    // Game state.
    this.game = game;

    this.game_started = false;

    // Local player.
    this.tank;

    // Background.
    this.land;  

    // User inputs.
    this.cursors;

    // Local player bullet group.
    this.bulletsLocal;

    // Remote player(s) bullet group.
    this.bulletsRemote;

    // Explosions group.
    this.explosions;

    // Holds messages sent from the server in the order recieved.
    this.message_queue = []; 

    //this.ws = new WebSocket(TwistedMetal.uri);
    var scheme   = "ws://"; 
    var uri = scheme + window.document.location.host + "/game";
    this.ws = new WebSocket(uri);

    // Websocket onopen event handler. 
    this.ws.addEventListener("open", function(event) {
        // Log connection status.
        console.log("Connected to game websocket.  Starting game...");
    });

    /*
     * Websocket on message recieved event handler. This is where all
     * messages get queued up for processing by the game engine update
     * function.  The server sends a 'FLAG' with each message, if that
     * flag is CREATE_CLIENT, the create client flag needs to be toggled
     * to true, so that the update function nows to create the local
     * client (player) before doing anything else. 
     */
    this.ws.addEventListener("message", function(event) {
        // Log the message.
        console.log("message: " + event.data);

        // Parse the json send from the server.
        message = JSON.parse(event.data)

        // Check for CREATE_CLIENT flag.
        if(message.action == CREATE_CLIENT) {
            this.create_client = true;
        }
        
        // Push the message to the queue.
        this.message_queue.push(message);

    }.bind(this)); // Allows callback this scope.
};

// Add functions to Game prototype.
TwistedMetal.Game.prototype = {
    // Game assets are loaded in Preloader: preload.

    // Create the game world.
	create: function () {
        // Log status.
        console.log("Game: create");

        // this.game.time.events.add(Phaser.Timer.SECOND * 120, this.endGame, this);

        //  Resize the game world to be a 2000 x 2000 square
        this.game.world.setBounds(-1000, -1000, 2000, 2000);

        // Full screen - priority 3
        // this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

        // Tiled scrolling background
        this.land = this.game.add.tileSprite(0, 0, 800, 600, 'earth');
        this.land.fixedToCamera = true;

        // Generate tank ammo for local. 
        this.bulletsLocal = this.game.add.group();
        this.bulletsLocal.enableBody = true;
        this.bulletsLocal.physicsBodyType = Phaser.Physics.ARCADE;
        this.bulletsLocal.createMultiple(30, 'bullet', 0, false);
        this.bulletsLocal.setAll('anchor.x', 0.5);
        this.bulletsLocal.setAll('anchor.y', 0.5);
        this.bulletsLocal.setAll('outOfBoundsKill', true);
        this.bulletsLocal.setAll('checkWorldBounds', true);
        
        // Generate tank ammo for remote. 
        this.bulletsRemote = this.game.add.group();
        this.bulletsRemote.enableBody = true;
        this.bulletsRemote.physicsBodyType = Phaser.Physics.ARCADE;
        this.bulletsRemote.createMultiple(30, 'bullet', 0, false);
        this.bulletsRemote.setAll('anchor.x', 0.5);
        this.bulletsRemote.setAll('anchor.y', 0.5);
        this.bulletsRemote.setAll('outOfBoundsKill', true);
        this.bulletsRemote.setAll('checkWorldBounds', true);

        //  Explosion pool.
        this.explosions = this.game.add.group();

        // Generate some explosions.
        for (var i = 0; i < 10; i++)
        {
            var explosionAnimation = this.explosions.create(0, 0, 'kaboom', [0], false);
            explosionAnimation.anchor.setTo(0.5, 0.5);
            explosionAnimation.animations.add('kaboom');
        }

        // Create the the local client (player).
        if(this.create_client) {
            // Ensure that the message queue is not empty.
            if(0 < this.message_queue.length) {
                // Pop (shift) the oldest message from the top of the queue.
                new_tank = this.message_queue.shift();

                console.log("new tank: " + JSON.stringify(new_tank));
                // Create the tank with set camera follow true - last param.
                var x = new_tank.x_pos;
                var y = new_tank.y_pos;
                var speed = 0;
                var angle = new_tank.angle;
                var turret_rotation = 0;
                var health = 3;
                var score = 0;
                var follow = true;
                
                // Create the local player's tank.
                this.tank = new Tank(new_tank.id, x, y, angle, turret_rotation, speed, health, score, follow, this.game, this.bulletsLocal);

                // Add the player to the clients hash.
                this.clients[this.tank.id] = this.tank;

                // Return create client flag back to false.
                this.create_client = false;
                
                // Log status.
                console.log("CREATING CLIENT: " + new_tank.id);


            }    
        }

        // this.logo = this.game.add.sprite(0, 200, 'logo');
        // this.logo.fixedToCamera = true;

        // this.game.input.onDown.add(this.removeLogo, this);

        // Set game boundaries.
        this.game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);

        // Center camera on player's tank.
        this.game.camera.focusOnXY(this.tank.getXPosition(), this.tank.getYPosition());

        // Create input cursor.
        this.cursors = this.game.input.keyboard.createCursorKeys();
	},     

    // removeLogo: function() {
    //     this.game.input.onDown.remove(this.removeLogo, this);
    //     this.logo.kill();

    // },

    /*
     * Update the client.  This is where all of the tanks will be updated.
     * There are three possible actions - add a remote client to the game
     * space, update an existing tank in the game space, and remove an
     * existing tank from the game space.  Which action to perform is
     * specified by in the message recieved by from the server.
     */
	update: function () {
        // Check for remote bullets hitting local tank (this.tank.tank <- body sprite).
        this.game.physics.arcade.overlap(this.bulletsRemote, this.tank.tank, this.bulletHitLocal, null, this);
        
        // Check if you're the lone survivor - WINNER!
        if(Object.keys(this.clients).length < 2 && this.game_started && this.tank.alive) {
            // Show winner screen.  Dont disable controls, winners get to
            // parade around!
            // this.game.debug.text('YOU WIN!', 250, 250);
            this.game_started = false;
            alert("YOU WIN!");
        }


        // Check for collisions between tanks.
        for(client_id_1 in this.clients) {
            for(client_id_2 in this.clients) {
                if(client_id_1 != client_id_2) {
                    console.log("COLLISION CHECK");
                    this.game.physics.arcade.collide(this.clients[client_id_1].tank, this.clients[client_id_2].tank)
                }
            }   
            // Check for local client hitting remote tanks with bullets.
            if(this.tank.id != client_id_1) {
                if(this.game.physics.arcade.overlap(this.bulletsLocal, this.clients[client_id_1].tank, this.bulletHitRemote, null, this)) {
                    // Remote tank hit.
                    this.bulletHitRemoteUpdate(client_id_1);
                }
            }
            // Remove tanks that are out of health.
            if(this.clients[client_id_1].getHealth() < 1) {
                console.log("Remove: client_id_1");
                this.removeClient(client_id_1);

                // Jail the client_id, so they cant rejoin.

                // If local is dead, disable mouse so player cant shoot, but
                // can still move around and watch the rest of the game.
                if(this.tank.id == client_id_1) {
                    this.input.mouse.enabled = false;

                    // You died...  Blow it up!
                    var explosionAnimation = this.explosions.getFirstExists(false);
                    explosionAnimation.reset(this.tank.getXPosition(), this.tank.getYPosition());
                    explosionAnimation.play('kaboom', 30, false, true);

                    // Show kill screen.
                    setTimeout(function() {
                        this.logo = this.game.add.sprite(0, 200, 'logo');
                        this.logo.fixedToCamera = true;
                    }.bind(this),500);
                }

            } else {
                // Realign all clients.
                this.clients[client_id_1].realignRemote();
            }
        }


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
            // Started the game.  The game only starts when there is more than one player.
            this.game_started = true;

            // Check that there are message to process.
            if(0 < this.message_queue.length) {
                // Get the message from the head of the queue.
                add_tank = this.message_queue.shift();

                // Create and add the tank to the tank hash.
                var x = add_tank.x_pos;
                var y = add_tank.y_pos;
                var speed = add_tank.speed;
                var angle = add_tank.angle;
                var turret_rotation = add_tank.turret_rotation;
                var health = add_tank.health;
                var score = add_tank.score;
                var follow = false;
                this.clients[add_tank.id] = new Tank(add_tank.id, x, y, angle, turret_rotation, speed, health, score, follow, this.game, this.bulletsRemote);
                this.clients[add_tank.id].realignRemote();

                // Toggle flag back to false.
                this.add_client = false;

                // Log event.
                console.log("ADDING CLIENT: " + JSON.stringify(add_tank));
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
                tank.setXPosition(tank_update.x_pos);
                tank.setYPosition(tank_update.y_pos);
                tank.setSpeed(tank_update.speed);
                tank.setTurretRotation(tank_update.turret_rotation);
                tank.setHealth(tank_update.health);
                tank.alive = tank_update.alive;
                tank.score = tank_update.score;
                //console.log(tank);
                //console.log("getSpeed(): " + tank.getSpeed());

                // Process update.
                //var tank_update = this.message_queue.shift();
                
                console.log("id: " + tank.id);
                console.log("x_pos: " + tank.x_pos);
                console.log("y_pos: " + tank.y_pos);
                console.log("angle: " + tank.angle);
                console.log("speed: " + tank.getSpeed());
                console.log("health: " + tank.health);
                console.log("firing: " + tank_update.fire);
                console.log("fire_x: " + tank_update.fire_x);
                console.log("fire_y: " + tank_update.fire_y);
                console.log("rotation: " + tank.getRotation());
                console.log("velocity: " + tank.getVelocity());
                console.log("score: " + tank.score);
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

                tank.realignRemote();

                // Check if tank is firing.
                if(tank_update.fire) {
                    // Pointer coords - where the bullet should go.
                    var x = tank_update.fire_x;
                    var y = tank_update.fire_y;
                    console.log("REMOTE TANK FIRE: " + x + "/" + y);
                    tank.fire(x, y);
                }
                

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

                // Pass the client id to the remove function.
                this.removeClient(delete_tank.id);

                // Toggle flag back to false.
                 this.delete_client = false;


            }   
        }

        // this.enemiesAlive = 0;

        // for (var i = 0; i < this.enemies.length; i++)
        // {
        //     if (this.enemies[i].alive)
        //     {
        //         this.enemiesAlive++;
        //         this.game.physics.arcade.collide(this.tank, this.enemies[i].clients[0]);
        //         this.game.physics.arcade.overlap(this.bulletsLocal, this.enemies[i].clients[0], this.bulletHitEnemy, null, this);
        //         this.enemies[i].update
        //     }
        // }

        // Setup the cursor - what buttons make the tank do what.
        if (this.cursors.left.isDown && this.tank.alive)
        {
            this.tank.rotateLeft(4);
            // Send the tanks instance as a json to the server.
            this.ws.send(this.tank.jsonify(false));
       }
        else if (this.cursors.right.isDown && this.tank.alive)
        {
            this.tank.rotateRight(4);
            // Send the tanks instance as a json to the server.
            this.ws.send(this.tank.jsonify(false));
        }

        if (this.cursors.up.isDown && this.tank.alive)
        {
            this.tank.setSpeed(300);
            // Send the tanks instance as a json to the server.
            this.ws.send(this.tank.jsonify(false));
        }
        else
        {
            if (this.tank.getSpeed() > 0 && this.tank.alive)
            {
                //console.log("Current Speed:" + this.tank.getSpeed());
                this.tank.reduceSpeed(4);
                // Send the tanks instance as a json to the server.
                this.ws.send(this.tank.jsonify(false));
            }
        }

        if (this.tank.getSpeed() > 0)
        {
            //console.log("update speed");
            // Set the tanks rotation, speed, and point.
            this.game.physics.arcade.velocityFromRotation(this.tank.getRotation(), this.tank.getSpeed(), this.tank.getVelocity());

            // Send the tanks instance as a json to the server.
            //this.ws.send(this.tank.jsonify(false));
        }

        this.land.tilePosition.x = -this.game.camera.x;
        this.land.tilePosition.y = -this.game.camera.y;

        //this.ws.send(this.tank.jsonify(false));
        // Realign the tank parts.
        this.tank.realignLocal();


        if (this.game.input.activePointer.isDown)
        {
            // Pointer coords - where the bullet should go.
            var x = this.game.input.activePointer.worldX;
            var y = this.game.input.activePointer.worldY;

            //  Boom!
            this.tank.fire(x, y);
                
            // Send the tanks instance as a json to the server.
            this.ws.send(this.tank.jsonify(true));
        }
	},

	endGame: function () {
        alert("GAME OVER!");
		// this.state.start('MainMenu');
        //this.clients[this.client_id] = null;
	},

    // Local bullet hits remote tank.  Update local.
    bulletHitRemote: function(tank, bullet) {
        // Kill the bullet sprite.
        bullet.kill();
    },

    // Local bullet hits remote tank.  Update server.
    bulletHitRemoteUpdate: function(client_id) {
        console.log(this.tank.id + " hit " + client_id);

        // Update the remote tanks health.
        var destroyed = this.clients[client_id].damage();

        // If the remote tanks health is <= 0, remove it from the game space
        // and update shooter's score.
        if (destroyed) {
            console.log(client_id + " DESTROYED!!!");

            // Update score.
            this.tank.score += 1;

            // Blow up it up!
            var explosionAnimation = this.explosions.getFirstExists(false);
            explosionAnimation.reset(this.clients[client_id].getXPosition(), this.clients[client_id].getYPosition());
            explosionAnimation.play('kaboom', 30, false, true);
        } else {
            console.log("damage: " + destroyed);
        }

        // Update the server.
        this.ws.send(this.clients[client_id].jsonify(false));
    },

    // Remove a client from the game space.
    removeClient: function(client_id) {
            if(this.clients[client_id] != null) {
                // Remove the tank sprite from game play.
                this.clients[client_id].remove();
                
                // Delete the tank from the tanks hash.
                delete this.clients[client_id];

                // Log event.
                console.log("DELETING CLIENT: " + client_id);
            }
    },

    bulletHitLocal: function(tank, bullet) {

        bullet.kill();

        // var destroyed = this.enemies[tank.name].damage();

        // if (destroyed)
        // {
        //     var explosionAnimation = this.explosions.getFirstExists(false);
        //     explosionAnimation.reset(tank.x, tank.y);
        //     explosionAnimation.play('kaboom', 30, false, true);
        // }

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
        this.game.debug.text('Health: ' + this.tank.health, 32, 224);
        this.game.debug.text('Alive: ' + this.tank.alive, 32, 256);
        this.game.debug.text('Score: ' + this.tank.score, 32, 288);
        // this.game.debug.text('Timer: ' + this.game.time.events.duration/1000, 32, 320);

        // this.game.debug.bodyInfo(this.tank.tank, 16, 24);

    },
};
