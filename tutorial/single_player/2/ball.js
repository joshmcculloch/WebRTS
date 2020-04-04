var Engine = require("../engine/clientEngine.js");

exports.Ball = class extends Engine.GameObject {
    constructor (engine,location) {
        super (engine, "ball",location, true);
        this.engine_id=-1;
        this.object_name = "cloud_object";
        this.speed = Math.random()*20+20;
        this.r_speed = (Math.random()-0.5)*2;
    }

    update (delta_time) {

        var moved = true;
        var velocity = $V([this.speed,0,0]);

        this.location = this.location.add(velocity.multiply(delta_time));
        this.rotation += this.r_speed * delta_time;

        if (this.location.e(1) > 4000) {
            this.location = $V([1, this.location.e(2),this.location.e(3)]);
        }
        return moved;
    }
};
