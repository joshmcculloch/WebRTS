/*
A Demo application for engine features
Josh McCulloch - October 2016
 */

var Engine = require("../engine/clientEngine.js");

class Player extends Engine.GameObject {
    constructor (engine, location) {
        super (engine, "player_left", location);
        this.speed = 100;

        this.nearby = [];
        this.next_nearby_check = 0;
        this.nearby_check_interval = 100; // Check 10 times a second
        this.descriptionBox = this.say("Hello, I'm Joe<br/>My current position is (X,X).",-1);
    }

    update_nearby() {
        if (new Date().getTime() > this.next_nearby_check) {
            this.nearby = this.engine.objectManager.get_neighbours(this.location, 120);
            this.next_nearby_check = new Date().getTime() + this.nearby_check_interval;
        }
    }

    draw () {
        if (this.engine.debug > 0) {
            for (let gameObject of this.nearby) {
                if (gameObject instanceof Sheep) {
                    this.engine.context.strokeStyle = "red";
                    this.engine.context.beginPath();
                    this.engine.context.moveTo(gameObject.location.e(1), gameObject.location.e(2));
                    this.engine.context.lineTo(this.location.e(1), this.location.e(2));
                    this.engine.context.stroke()
                }
            }
        }
        super.draw()
    }

    update (delta_time) {
        var moved = false;
        this.update_nearby();
        for(let gameObject of this.nearby) {
            if (gameObject instanceof Sheep) {
                gameObject.scare(this);
            }
        }
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

            this.descriptionBox.setLocation(this.location.add($V([20,-20,0])));
            this.descriptionBox.updateText("Hello, I'm Joe<br/>My current position is ("+
                Math.floor(this.location.e(1))+","+
                Math.floor(this.location.e(2))+").");

        }
        return moved;
    }
}

class Sheep extends Engine.GameObject {
    constructor (engine,location) {
        super (engine, "sheep_left",location);
        this.speed = 30;
        this.target = location;
        this.nextTargetTime = new Date().getTime() + Math.random()*60*1000;

    }

    update (delta_time) {
        var moved = false;
        // Check if it has been enough time to pick a new target location
        if (new Date().getTime() > this.nextTargetTime) {
            this.nextTargetTime += Math.random() * 120 * 1000;
            this.target = $V([Math.random() * 700 + 10, Math.random() * 700 + 100,1]);
            this.say("baaa", 1000);
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

    scare(gameObject) {
        // Measure distance to player and set target in opposite direction if so
        var playerVector = gameObject.location.subtract(this.location);
        var playerDistance = playerVector.modulus()
        if (playerDistance < 100) {
            this.target = this.location.subtract(playerVector.toUnitVector().multiply(100-playerDistance));
        }
    }
}

// Create new engine
var engine = new Engine.ClientEngine("mainCanvas");


// Load the assets manifest
engine.assetManager.load_manifest("game/asset_manifest.json");

// Create Player object
var player = new Player(engine, $V([622,100,1]));
engine.objectManager.add_object(player);

// Create trees
for(var i=0; i<50; i++) {
    engine.objectManager.add_object(new Engine.GameObject(engine, "tree", $V([
        Math.floor(Math.random()*700+10),
        Math.floor(Math.random()*700+100),
        1
    ])));
}

// Create Sheep
for(var i=0; i<=1000; i++) {
    engine.objectManager.add_object(new Sheep(engine, $V([Math.random()*750+10,Math.random()*650+100,1])));
}

for(var x=0; x<800; x+=50) {
    for(var y=0; y<800; y+=50) {
        if (Math.random() > 0.3) {
            engine.objectManager.add_object(new Engine.GameObject(engine, "grass", $V([x, y, 0])));
        } else {
            engine.objectManager.add_object(new Engine.GameObject(engine, "dirt", $V([x, y, 0])));
        }
    }
    
}

// Start Game
engine.start();
