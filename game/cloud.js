var Engine = require("../engine/clientEngine.js");

exports.Cloud = class extends Engine.GameObject {
    constructor (engine,location) {
        super (engine, "cloud",location, true);
        this.engine_id=-1;
        this.object_name = "cloud_object";
        this.speed = 30;
    }

    update (delta_time) {

        var moved = true;
        var velocity = $V([40,0,0]);
        this.location = this.location.add(velocity.multiply(delta_time));

        if (this.location.e(1) > 4000) {
            this.location = $V([1, this.location.e(2),this.location.e(3)]);
        }
        return moved;
    }
};