// Tank Prototype.
function Tank(id, x_pos, y_pos, angle, turret_rotation, speed, health, score, follow, game, bullets) {
    this.id = id;
    this.x_pos = x_pos;
    this.y_pos = y_pos;
    this.health = health;
    this.score = score;
    this.follow = follow;

    this.game = game;
    this.bullets = bullets;

    this.fire_x = null;
    this.fire_y = null;

    this.fireRate = 100;
    this.nextFire = 0;
    this.alive = true;

    //  The base of our tank.
    this.tank = this.game.add.sprite(this.x_pos, this.y_pos, 'tank', 'tank1');
    this.tank.anchor.setTo(0.5, 0.5);
    this.tank.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true);

    // Set the tank angle.
    this.tank.angle = angle;
    this.tank.speed = speed;

    this.angle = this.tank.angle;
    this.speed = this.tank.speed;

    // The tank turret.
    this.turret = this.game.add.sprite(this.x_pos, this.y_pos, 'tank', 'turret');
    this.turret.anchor.setTo(0.3, 0.5);
    this.turret.rotation = turret_rotation;

    // The shadow under the tank.
    this.shadow = this.game.add.sprite(this.x_pos, this.y_pos, 'tank', 'shadow');
    this.shadow.anchor.setTo(0.5, 0.5);
    
    //  Apply physics to the tank.  Limit its speed and slow it down
    // when not under under power.
    this.game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.drag.set(0.2);
    this.tank.body.maxVelocity.setTo(400, 400);
    this.tank.body.immovable = false;
    this.tank.body.collideWorldBounds = true;
    //this.tank.body.bounce.setTo(0.5,0.5);

    this.tank.bringToTop();
    this.turret.bringToTop();

    // Set the camera to follow the tank, so it can not drive out of user view.
    if(follow) {
        this.game.camera.follow(this.tank);
    }   
}

// Remove the tank from the game space.
Tank.prototype.remove = function() {
    this.tank.kill();
    this.turret.kill();
    this.shadow.kill();
}

// Damage the tank. Returns true if tank is out of health.
Tank.prototype.damage = function() {
    // Decrement health.
    this.health -= 1;

    if(this.health <= 0) {
        this.alive = false;

        this.remove();

        return true;
    }

    return false;
}

Tank.prototype.realignLocal = function() {
        this.shadow.x = this.tank.x;
        this.shadow.y = this.tank.y;
        this.shadow.rotation = this.tank.rotation;

        this.turret.x = this.tank.x;
        this.turret.y = this.tank.y;

        this.turret.rotation = this.game.physics.arcade.angleToPointer(this.turret);
}

// Realign all of the tanks parts. Called every update.
Tank.prototype.realignRemote = function() {
        this.shadow.x = this.tank.x;
        this.shadow.y = this.tank.y;
        this.shadow.rotation = this.tank.rotation;

        this.turret.x = this.tank.x;
        this.turret.y = this.tank.y;

        //this.turret.rotation = this.game.physics.arcade.angleToPointer(this.turret);
}

Tank.prototype.setXPosition= function(x) {
    this.tank.x = x;
}

Tank.prototype.setYPosition= function(y) {
    this.tank.y = y;
}

// Set tank angle.
Tank.prototype.setAngle = function(angle) {
    this.angle = angle;
    this.tank.angle = this.angle;
    this.turret.angle = this.angle;
    this.shadow.angle = this.angle;
} 

Tank.prototype.setTurretRotation = function(angle) {
    this.turret.rotation = angle;
} 

// Set tank speed.
Tank.prototype.setSpeed = function(speed) {
    this.speed = speed;
    this.tank.speed = this.speed;
    this.turret.speed = this.speed;
    this.shadow.speed = this.speed;
} 


Tank.prototype.setHealth = function(health) {
    this.health = health;
}

// Rotate the tank left.
Tank.prototype.rotateLeft = function(degrees) {
    // console.log("turning left");
    this.tank.angle -= degrees;

}

// Rotate the tank right.
Tank.prototype.rotateRight = function(degrees) {
    // console.log("turning right");
    this.tank.angle += degrees;
} 

// Slow down the tank.
Tank.prototype.reduceSpeed = function(increment) {
    this.tank.speed -= increment;
}

// Get tank id.
Tank.prototype.getID = function() {
    return this.id;
} 

// Get tanks health.
Tank.prototype.getHealth = function() {
    return this.health;
} 

// Get tank angle.
Tank.prototype.getAngle = function() {
    return this.tank.angle;
} 

// Get the tank's current rotation.
Tank.prototype.getRotation = function() {
    return this.tank.rotation;
}

// Get the tank's current velocity.
Tank.prototype.getVelocity = function() {
    return this.tank.body.velocity;
}

// Get the tank's current speed.
Tank.prototype.getSpeed = function() {
    return this.tank.speed;
}

// Get the tank's current X positon.
Tank.prototype.getXPosition= function() {
    return this.tank.x;
}

// Get the tank's current Y position.
Tank.prototype.getYPosition = function() {
    return this.tank.y;
}

// Get the tank's current Y position.
Tank.prototype.getHealth = function() {
    return this.health;
}

// Fire the tanks cannon.
Tank.prototype.fire = function(x, y) {
    this.fire_x = x;
    this.fire_y = y;
     console.log(x + " / " + y);
    // Limit the rate of fire.
    if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
    {

        // console.log(this.game.time.now + " > " + this.nextFire);
        this.nextFire = this.game.time.now + this.fireRate;

        var bullet = this.bullets.getFirstExists(false);

        bullet.reset(this.turret.x, this.turret.y);

        bullet.rotation = this.game.physics.arcade.moveToXY(bullet, x, y, 1000, 500);
    } else {
        // Cant fire, timeout has not finished.
        // console.log(this.game.time.now +" < " + this.nextFire);
    }
}

// Return json representation of tank state.
Tank.prototype.jsonify = function(firing) {
    return JSON.stringify({id: this.id, x_pos: this.tank.x, y_pos: this.tank.y,
                           angle: this.tank.angle, turret_rotation: this.turret.rotation,
                           speed: this.tank.speed, health: this.health, score: this.score, alive: this.alive, fire: firing,
                           fire_x: this.fire_x, fire_y: this.fire_y});
}
