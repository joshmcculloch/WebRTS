/*
A Demo application for engine features
Josh McCulloch - October 2016
 */

class Player extends GameObject {
    constructor (engine, location) {
        super (engine, "player_left", location);
        this.speed = 50;
    }

    update (delta_time) {
        var moved = false;
        // Calculate new direction based on user input
        var v = 0;
        var h = 0;
        if (this.engine.inputManager.up) v-= 1;
        if (this.engine.inputManager.down) v+= 1;
        if (this.engine.inputManager.left) h-= 1;
        if (this.engine.inputManager.right) h+= 1;

        // Build velocity vector,
        var velocity = $V([h,v,0]).toUnitVector().multiply(this.speed);

        // Update location
        this.location = this.location.add(velocity.multiply(delta_time));

        // Update player image based on new velocity
        if (velocity.e(1) < 0) this.image_identifier = "player_left";
        if (velocity.e(1) > 0) this.image_identifier = "player_right";

        if (velocity.modulus() > 0) {
            moved = true;
        }
        return moved;
    }
}

class Sheep extends GameObject {
    constructor (engine,location, player) {
        super (engine, "sheep_left",location);
        this.player = player;
        this.speed = 30;
        this.target = location;
        this.nextTargetTime = new Date().getTime() + Math.random()*60*1000;

    }

    update (delta_time) {
        var moved = false;
        // Check if it has been enough time to pick a new target location
        if (new Date().getTime() > this.nextTargetTime) {
            this.nextTargetTime += Math.random() * 60 * 1000;
            this.target = $V([Math.random() * 700 + 10, Math.random() * 700 + 100,1]);
        }

        // Measure distance to player and set target in opposite direction if so
        var playerVector = this.player.location.subtract(this.location);
        if (playerVector.modulus() < 70) {
            this.target = this.location.subtract(playerVector);
        }

        // Move towards target, stop if within radius of 5
        var targetVector = this.target.subtract(this.location);
        if (targetVector.modulus() > 5) {

            // Calculate velocity vector
            var velocity = targetVector.toUnitVector().multiply(this.speed);
            this.location = this.location.add(velocity.multiply(delta_time));

            // Update image based on new direction
            if (velocity.e(1) < 0) this.image_identifier = "sheep_left";
            if (velocity.e(1) > 0) this.image_identifier = "sheep_right";
            moved = true;
        }
        return moved;
    }
}

// Create new engine
var engine = new Engine("mainCanvas");

// Load the assets manifest
engine.assetManager.load_manifest("game/asset_manifest.json");

// Create Player object
var player = new Player(engine, $V([622,100,1]));
engine.objectManager.add_object(player);

// Create trees
for(var i=0; i<50; i++) {
    engine.objectManager.add_object(new GameObject(engine, "tree", $V([
        Math.floor(Math.random()*700+10),
        Math.floor(Math.random()*700+100),
        1
    ])));
}

// Create Sheep
for(var i=0; i<=1000; i++) {
    engine.objectManager.add_object(new Sheep(engine, $V([Math.random()*750+10,Math.random()*650+100,1]), player));
}

for(var x=0; x<800; x+=50) {
    for(var y=0; y<800; y+=50) {
        if (Math.random() > 0.3) {
            engine.objectManager.add_object(new GameObject(engine, "grass", $V([x, y, 0])));
        } else {
            engine.objectManager.add_object(new GameObject(engine, "dirt", $V([x, y, 0])));
        }
    }
    
}

// Start Game
engine.start();
