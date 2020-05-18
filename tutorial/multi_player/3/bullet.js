var Engine = require("../engine/clientEngine.js");
var ab = require("../engine/aabb.js");
var zb = require("./zombie.js");
var bs = require("./bloodsplatter.js");


exports.Bullet = class extends Engine.GameObject {
    constructor (engine,location) {
        super (engine, "player_left",location, true);
        this.object_name = "bullet_object";
        this.members.velocity = $V([0,0,0]);
        this.members.distance_travelled = 0;
        this.members.range = 150+Math.random()*250;
        this.members.kill_range = 10;
        this.members.last_render_location = this.location;
    }

    draw() {
      this.engine.context.fillStyle = "yellow";
      this.engine.context.strokeStyle = "yellow";
      this.engine.context.lineWidth = 1;
      this.engine.context.beginPath();
      this.engine.context.moveTo(this.members.last_render_location.e(1), this.members.last_render_location.e(2));
      this.engine.context.lineTo(this.location.e(1), this.location.e(2));
      this.engine.context.stroke()

      this.engine.context.translate(this.location.e(1),this.location.e(2));
      //this.engine.context.rotate(this.rotation);

      this.engine.context.beginPath();
      this.engine.context.arc(0,0,1,0,2*Math.PI);
      this.engine.context.fill()

      this.members.last_render_location = this.location;
    }


    update (delta_time) {
        var moved = true;
        this.members.distance_travelled += this.members.velocity.modulus()*delta_time;
        if (this.members.distance_travelled > this.members.range) {
          this.delete();
        }

        if (this.engine.server) {
          var update_distance = this.members.velocity.modulus()*delta_time;
          var step_size = update_distance/this.members.kill_range/2;
          var steps = Math.ceil(update_distance/step_size);


          var nearby = this.engine.objectManager.get_neighbours(
            this.location.add(this.members.velocity.multiply(delta_time/2)),  //go halfway along vector and then select gameobjects from there
            update_distance+this.members.kill_range);

          var bullet_dir = this.members.velocity.toUnitVector();
          for (let gameObject of nearby) {
            if (gameObject instanceof zb.Zombie) {

              for(var i=0; i<steps; i++) {
                var step_bullet_location = this.location.add(bullet_dir.x(i));
                if (step_bullet_location.distanceFrom(gameObject.location) < this.members.kill_range) {
                  gameObject.kill();
                  this.delete();


                  for(var b=0; b<30; b++) {
                    var blood = new bs.BloodSplatter(this.engine, gameObject.location)
                    var rdir = $V([(Math.random()-0.5), (Math.random()-0.5), 0])
                    blood.members.direction = this.members.velocity.toUnitVector().add(rdir)
                    blood.members.velocity = this.members.velocity.modulus() * Math.random();
                    this.engine.objectManager.add_object(blood);
                  }
                  return;
                }
              }
            }
          }
        }


        this.location = this.location.add(this.members.velocity.multiply(delta_time));

        return moved;
    }

    getAABB () {
        return new ab.AABB(this.location.e(1),this.location.e(2),10,10);

    }
};
