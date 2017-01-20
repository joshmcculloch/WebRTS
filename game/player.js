var Engine = require("../engine/clientEngine.js");
var Sheep = require("./sheep.js");

exports.Player = class extends Engine.GameObject {
    constructor (engine, location) {
        super (engine, "player_left", location);
        this.engine_id=-1;
        this.object_name = "player_object";
        this.speed = 100;

        this.nearby = [];
        this.next_nearby_check = 0;
        this.nearby_check_interval = 100; // Check 10 times a second
        this.descriptionBox = null;

        this.engine.cameraPos = $V([
            Math.floor(this.location.e(1)),
            Math.floor(this.location.e(2)),0]);
    }

    to_descriptor() {
        var description = super.to_descriptor();
        description.speed = this.speed;
        return description;
    }

    from_descriptor (description) {
        super.from_descriptor(description);
        this.speed = description.speed;
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
                if (gameObject instanceof Sheep.Sheep) {
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
        if (!this.descriptionBox) {
            this.descriptionBox = this.say("Hello, I'm Joe<br/>My current position is (X,X).", -1);
        }
        var moved = false;

        if (this.engine.server) {
            this.update_nearby();
            for (let gameObject of this.nearby) {
                if (gameObject instanceof Sheep.Sheep) {
                    gameObject.scare(this);
                }
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
            this.descriptionBox.setLocation(
                this.engine.camera.worldToCamera(this.location.add($V([20,-20,0])))
            );
            this.descriptionBox.updateText("Hello, I'm Joe<br/>My current position is ("+
                Math.floor(this.location.e(1))+","+
                Math.floor(this.location.e(2))+").");
        }

        this.engine.camera.setLocation($V([
            Math.floor(this.location.e(1)),
            Math.floor(this.location.e(2)),0]).add(
            this.engine.inputManager.mousePos
                .subtract($V([this.engine.canvas.width/2, this.engine.canvas.height/2,0]))
                .x(0.2)));
        return moved;
    }
}