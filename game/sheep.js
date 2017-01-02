var Engine = require("../engine/clientEngine.js");
exports.Sheep = class extends Engine.GameObject {
    constructor (engine,location) {
        super (engine, "sheep_left",location);
        this.engine_id=-1;
        this.object_name = "sheep_object";
        this.speed = 30;
        this.target = location;
        this.nextTargetTime = new Date().getTime() + Math.random()*60*1000;
    }

    to_descriptor() {
        var description = super.to_descriptor();
        description.speed = this.speed;
        description.target = {
            x: this.target.e(1),
            y: this.target.e(2),
            z: this.target.e(3)};
        return description;
    }

    from_descriptor (description) {
        super.from_descriptor(description);
        this.speed = description.speed;
        this.target = $V([
            description.target.x,
            description.target.y,
            description.target.z]);
    }

    update (delta_time) {
        var moved = false;
        // Check if it has been enough time to pick a new target location
        if (new Date().getTime() > this.nextTargetTime) {
            this.nextTargetTime += Math.random() * 120 * 1000;
            this.target = $V([Math.random()*2800+100,Math.random()*2800+100,1]);
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