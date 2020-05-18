var Engine = require("../engine/clientEngine.js");
var ab = require("../engine/aabb.js");


exports.BloodSplatter = class extends Engine.GameObject {
    constructor (engine,location) {
        super (engine, "player_left",location, true);
        this.object_name = "bloodsplatter_object";
        this.members.direction = $V([0,0,0]);
        this.members.distance_travelled = 0;
        this.members.remaining_time = 10;
        this.members.velocity = 10;
    }

    draw() {
      this.engine.context.translate(this.location.e(1),this.location.e(2));
      this.engine.context.fillStyle = "rgba(255,0,0,0.1)";
      this.engine.context.beginPath();
      this.engine.context.arc(0,0,4,0,2*Math.PI);
      this.engine.context.fill()
    }


    update (delta_time) {
        var moved = true;
        this.members.remaining_time -= delta_time;

        if (this.engine.server) {
          if (this.members.remaining_time < 0) {
            this.delete();
          }
        }

        if (this.members.velocity > 1) {
          this.location = this.location.add(this.members.direction.multiply(this.members.velocity*delta_time));
          this.members.velocity *= (1-10*delta_time)
        }


        return moved;
    }

    getAABB () {
        return new ab.AABB(this.location.e(1),this.location.e(2),10,10);

    }
};
