var Engine = require("../engine/clientEngine.js");
var Sheep = require("./sheep.js");
var iobj = require("./interactableObject.js");
var lm = require("../engine/lightingManager.js");

exports.PlayerCamera = class extends Engine.GameObject {
    constructor (engine, location) {
        super (engine, "camera", location, true);
        this.engine_id=-1;
        this.object_name = "Player_camera";
        this.speed = 150;

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

    draw () {
        super.draw()
    }

    onClick(e) {
        super.onClick(event);
    }

    update (delta_time) {
        var moved = false;

        if (this.engine.server) {
        }

        if (this.engine.client && this.clientOwned(this.engine.networkManager.userID)) {
            // Calculate new direction based on user input
            var v = 0;
            var h = 0;
            if (this.engine.inputManager.up) v -= 1;
            if (this.engine.inputManager.down) v += 1;
            if (this.engine.inputManager.left) h -= 1;
            if (this.engine.inputManager.right) h += 1;


            // Build velocity vector,
            var velocity = $V([h,v,0]).toUnitVector().multiply(this.speed);

            // Update location
            this.location = this.location.add(velocity.multiply(delta_time));


            if (velocity.modulus() > 0) {
                moved = true;
                this.call_remote("setLocation", [this.location.e(1),this.location.e(2)]);
            }
            this.engine.camera.setLocation($V([
                Math.floor(this.location.e(1)),
                Math.floor(this.location.e(2)), 0]));

        }
        return moved;
    }

    setLocation(x,y) {
        if (this.engine.server) {
            this.call_remote("setLocation",[x,y])
            this.location = new $V([x, y, 1]);
        }
        if (this.engine.client && !this.clientOwned(this.engine.networkManager.userID)) {
            this.location = new $V([x, y, 1]);
        }
    }
}