var Engine = require("../engine/clientEngine.js");
var ab = require("../engine/aabb.js");
var zb = require("./zombie.js");


exports.Bullet = class extends Engine.GameObject {
    constructor (engine,location, velocity) {
        super (engine, "player_left",location, true);
        this.velocity = velocity;
        this.distance_travelled = 0;
        this.range = 150+Math.random()*250;
        this.nearby = [];
        this.kill_range = 10;
        this.last_render_location = this.location;
    }

    draw() {
      this.engine.context.fillStyle = "yellow";
      this.engine.context.strokeStyle = "yellow";
      this.engine.context.lineWidth = 1;
      this.engine.context.beginPath();
      this.engine.context.moveTo(this.last_render_location.e(1), this.last_render_location.e(2));
      this.engine.context.lineTo(this.location.e(1), this.location.e(2));
      this.engine.context.stroke()

      this.engine.context.translate(this.location.e(1),this.location.e(2));
      this.engine.context.rotate(this.rotation);

      this.engine.context.beginPath();
      this.engine.context.arc(0,0,1,0,2*Math.PI);
      this.engine.context.fill()

      this.last_render_location = this.location;
    }


    update (delta_time) {
        var moved = true;
        this.distance_travelled += this.velocity.modulus()*delta_time;
        if (this.distance_travelled > this.range) {
          this.delete();
        }

        var update_distance = this.velocity.modulus()*delta_time;
        var step_size = update_distance/this.kill_range/2;
        var steps = Math.ceil(update_distance/step_size);

        this.nearby = this.engine.objectManager.get_neighbours(
          this.location.add(this.velocity.multiply(delta_time/2)),  //go halfway along vector and then select gameobjects from there
          update_distance+this.kill_range);

        var bullet_dir = this.velocity.toUnitVector();
        for (let gameObject of this.nearby) {
          if (gameObject instanceof zb.Zombie) {
            for(var i=0; i<steps; i++) {
              var step_bullet_location = this.location.add(bullet_dir.x(i));
              if (step_bullet_location.distanceFrom(gameObject) < this.kill_range) {
                gameObject.kill();
                this.delete();
              }
            }

          }
        }



        this.location = this.location.add(this.velocity.multiply(delta_time));

        /*
        this.nearby = this.engine.objectManager.get_neighbours(this.location, 10);
        for (let gameObject of this.nearby) {
          if (gameObject instanceof zb.Zombie) {
            gameObject.kill();
            this.delete();
          }
        }*/

        return moved;
    }

    getAABB () {
        return new ab.AABB(this.location.e(1),this.location.e(2),10,10);

    }
};
