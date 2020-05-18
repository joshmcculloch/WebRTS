var Engine = require("../engine/clientEngine.js");

exports.Zombie = class extends Engine.GameObject {
    constructor (engine, location) {
        super (engine, "player_left",location);
        this.engine_id=-1;
        this.object_name = "zombie_object";
        this.members.speed = Math.random()*10+10;
        this.members.dead = false;
        this.members.velocity = $V([this.members.speed,0,0]);

        this.next_sound = Math.random()*10;

    }

    respawn () {
      this.location = $V([-500, this.location.e(2),this.location.e(3)]);
    }

    kill () {
      this.members.dead = true;
      this.engine.assetManager.play_audio_once("pop");
    }

    draw () {
        if (this.can_see_player) {
          this.engine.context.strokeStyle = "red";
          this.engine.context.beginPath();
          this.engine.context.moveTo(this.player.location.e(1), this.player.location.e(2));
          this.engine.context.lineTo(this.location.e(1), this.location.e(2));
          this.engine.context.stroke()
        }
        super.draw()
    }

    update (delta_time) {

        var player_distance = 1000;//this.location.distanceFrom(this.player.location);
        this.can_see_player = player_distance < 500;

        this.next_sound -= delta_time;
        if (this.engine.client) {
          if (this.next_sound < 0) {
            if(this.can_see_player) {
              var r = Math.random();
              if (r < 0.33) {
                this.engine.assetManager.play_audio_once("zombie1");
              } else if (r < 0.66) {
                this.engine.assetManager.play_audio_once("zombie2");
              } else {
                this.engine.assetManager.play_audio_once("zombie3");
              }
            }
            this.next_sound += Math.random()*10;
          }
        }


        if (this.can_see_player) {
          this.members.velocity = this.player.location.subtract(this.location).toUnitVector().x(this.speed*2)
        }

        this.location = this.location.add(this.members.velocity.multiply(delta_time));
        if (this.members.velocity.modulus() > 0) {
          this.location = this.location.add(this.members.velocity.multiply(delta_time));
          if (this.members.velocity.e(1) < 0) {
            this.members.image_identifier = "player_left";
          };
          if (this.members.velocity.e(1) > 0) {
            this.members.image_identifier = "player_right";
          };
        }

        if (this.engine.server) {
          if (this.location.e(1) > 500 || this.members.dead) {
              this.members.dead = false;
              this.respawn();
              this.call_remote("respawn",[])
          }
        }

        return true;
    }
};
