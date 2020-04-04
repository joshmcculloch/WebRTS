var Engine = require("../engine/clientEngine.js");
var Sheep = require("./sheep.js");
var iobj = require("./interactableObject.js");
var lm = require("../engine/lightingManager.js");

exports.Player = class extends iobj.Interactable {


    constructor (engine, location) {
        super (engine, "player_left", location, true);
        this.STATES = {
            idle: 0,
            walking: 1
        };
        this.engine_id=-1;
        this.object_name = "player_object";
        this.speed = 100;
        this.state = this.STATES.idle;
        this.target = this.location;

        this.nearby = [];
        this.next_nearby_check = 0;
        this.nearby_check_interval = 100; // Check 10 times a second
        this.descriptionBox = null;

        this.engine.cameraPos = $V([
            Math.floor(this.location.e(1)),
            Math.floor(this.location.e(2)),0]);

        this.light = new lm.Light(new lm.LightColour(247, 215, 54), 200, this.location);
        this.selectable = true;
    }

    to_descriptor() {
        var description = super.to_descriptor();
        description.speed = this.speed;
        description.state = this.state;
        description.target = {
            x: this.target.e(1),
            y: this.target.e(2),
            z: this.target.e(3)};
        return description;
    }

    from_descriptor (description) {
        super.from_descriptor(description);
        this.speed = description.speed;
        this.state = description.state;
        this.target = $V([
            description.target.x,
            description.target.y,
            description.target.z]);
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

    onClick(e) {
        super.onClick(event);
    }

    update (delta_time) {
        //if (!this.descriptionBox) {
        //    this.descriptionBox = this.say("Hello, I'm Joe<br/>My current position is (X,X).", -1);
        //}
        var moved = false;

        if (this.engine.server) {
            this.update_nearby();
            for (let gameObject of this.nearby) {
                if (gameObject instanceof Sheep.Sheep) {
                    gameObject.scare(this);
                }
            }
        }

        // Move towards target, stop if within radius of 5
        var targetVector = this.target.subtract(this.location);
        if (targetVector.modulus() > 5) {

            // Calculate velocity vector
            var velocity = targetVector.toUnitVector().multiply(this.speed);
            this.location = this.location.add(velocity.multiply(delta_time));

            // Update image based on new direction
            if (velocity.e(1) < 0) this.image_identifier = "player_left";
            if (velocity.e(1) > 0) this.image_identifier = "player_right";
            moved = true;
        } else {

        }
        return moved;
    }

    setState(state) {
        if (this.engine.server) {
            this.call_remote("setState",state)
            this.state = state;
        }
        if (this.engine.client && !this.clientOwned(this.engine.networkManager.userID)) {
            this.state = state;
        }
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

    setTarget(x,y) {
        // if the function is not needed dont do anything.
        // this is to stop the message bouncing back and forward
        console.log("Setting new target!");
        this.target = new $V([x,y,1]);

        if (this.engine.server) {
            this.call_remote("setTarget",[x,y]);
        }

        /*
        else if (this.engine.client && this.clientOwned(this.engine.networkManager.userID)) {
            this.call_remote("setTarget",[x,y]);
        }*/
    }

    interact(gameObject) {
        console.log(this.engine.client, this.clientOwned(this.engine.networkManager.userID));
        if (this.engine.client && this.clientOwned(this.engine.networkManager.userID)) {
            this.call_remote("setTarget",[gameObject.location.e(1), gameObject.location.e(2)]);
        }

        //this.setTarget(gameObject.location.e(1), gameObject.location.e(2));
    }
}