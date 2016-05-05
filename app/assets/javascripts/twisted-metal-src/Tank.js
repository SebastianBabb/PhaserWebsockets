// Tank Prototype.
function Tank(id, game, bullets, follow) {
    this.id = id;
    this.game = game;
    this.bullets = bullets;
    this.follow = follow;

    this.health = 3;
    this.fireRate = 100;
    this.nextFire = 0;
    this.currentSpeed = 0;
    this.alive = true;

    //  The base of our tank.
    this.tank = this.game.add.sprite(0, 0, 'tank', 'tank1');
    this.tank.anchor.setTo(0.5, 0.5);
    this.tank.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true);

    //  Apply physics to the tank.  Limit its speed and slow it down
    // when not under under power.
    this.game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.drag.set(0.2);
    this.tank.body.maxVelocity.setTo(400, 400);
    this.tank.body.collideWorldBounds = true;

    // The tank turret.
    this.turret = this.game.add.sprite(0, 0, 'tank', 'turret');
    this.turret.anchor.setTo(0.3, 0.5);

    // The shadow under the tank.
    this.shadow = this.game.add.sprite(0, 0, 'tank', 'shadow');
    this.shadow.anchor.setTo(0.5, 0.5);

    this.tank.bringToTop();
    this.turret.bringToTop();

    // Set the camera to follow the tank, so it can not drive out of user view.
    if(follow) {
        this.game.camera.follow(this.tank);
    }   
}

Tank.prototype.remove = function() {
    this.tank.kill();
    this.turret.kill();
    this.shadow.kill();
}

// Realign all of the tanks parts. Called every update.
Tank.prototype.realign = function() {
        this.shadow.x = this.tank.x;
        this.shadow.y = this.tank.y;
        this.shadow.rotation = this.tank.rotation;

        this.turret.x = this.tank.x;
        this.turret.y = this.tank.y;

        this.turret.rotation = this.game.physics.arcade.angleToPointer(this.turret);
}

// Get tank id.
Tank.prototype.getID = function() {
    return this.id;
} 

// Rotate the tank right.
Tank.prototype.getAngle = function() {
    return this.tank.angle;
} 

// Rotate the tank left.
Tank.prototype.turnLeft = function() {
    // console.log("turning left");
    this.tank.angle -= 4;

}

// Rotate the tank right.
Tank.prototype.turnRight = function() {
    // console.log("turning right");
    this.tank.angle += 4;
} 

// Rotate the tank right.
Tank.prototype.getAngle = function() {
    return this.tank.angle;
} 


// Move the tank forward.
Tank.prototype.moveForward= function() {
   // console.log("forward");
   //  The speed we'll travel at
   this.tank.currentSpeed = 300;
} 

// Get the tank's current velocity.
Tank.prototype.velocity = function() {
    return this.tank.body.velocity;
}

// Get the tank's current rotation.
Tank.prototype.rotation = function() {
    return this.tank.rotation;
}

// Get the tank's current speed.
Tank.prototype.getSpeed = function() {
    return this.tank.currentSpeed;
}

// Get the tank's current X positon.
Tank.prototype.getXPosition= function() {
    return this.tank.x;
}

// Get the tank's current Y position.
Tank.prototype.getYPosition = function() {
    return this.tank.y;
}

// Slow down the tank.
Tank.prototype.reduceSpeed = function() {
    this.tank.currentSpeed -= 4;
}

// Fire the tanks cannon.
Tank.prototype.fire = function() {
    // console.log("fire");
    // Limit the rate of fire.
    if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
    {

        // console.log(this.game.time.now + " > " + this.nextFire);
        this.nextFire = this.game.time.now + this.fireRate;

        var bullet = this.bullets.getFirstExists(false);

        bullet.reset(this.turret.x, this.turret.y);

        bullet.rotation = this.game.physics.arcade.moveToPointer(bullet, 1000, this.game.input.activePointer, 500);
    } else {
        // Cant fire, timeout has not finished.
        // console.log(this.game.time.now +" < " + this.nextFire);
    }
}
