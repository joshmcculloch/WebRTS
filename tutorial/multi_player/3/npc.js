var Engine = require("../engine/clientEngine.js");
var lm = require("../engine/lightingManager.js");
var go = require("../engine/gameObject.js");
var bullet = require("./bullet.js");
var syl = require("sylvester");
var zb = require("./zombie.js")

exports.NPC = class extends go.GameObject {


    constructor (engine, location) {
        super (engine, "player_left", location, true);
        this.object_name = "npc_object";
        this.members.speed = 100;
        this.members.velocity = $V([0,0,0]);
        this.members.gun_dir = $V([1,0,0]);
        this.members.spread = 0.5;
        this.members.target = 6;
        this.members.fire_cooldown = 0;

        this.light = new lm.Light(new lm.LightColour(247, 215, 54), 200, this.location);
    }


    check_fire() {
      var target = this.engine.objectManager.get_object_by_id(this.members.target);

      if (target && this.members.fire_cooldown < 0) {


        var barrel_start = $V([0,-4,0]);
        var barrel_end = barrel_start.add(this.members.gun_dir.multiply(10));

        // Shotgun
        this.members.fire_cooldown = 1;
        for (var i=0; i<10; i++) {
          var spdir = $V([(Math.random()-0.5)*this.members.spread, (Math.random()-0.5)*this.members.spread, 0])
          var bullet_dir = this.members.gun_dir.add(spdir)
          var b = new bullet.Bullet(this.engine, this.location.add(barrel_end));
          b.members.velocity = bullet_dir.multiply(800);
          this.engine.objectManager.add_object(b);
        }

        this.call_remote("fire",{});
      }
    }

    check_target() {

      var nearby = this.engine.objectManager.get_neighbours(this.location, 250);
      var previous_taget = this.members.target;
      this.members.target = -1
      var min_distance = 999;
      for (let gameObject of nearby) {
        if (gameObject instanceof zb.Zombie) {
          var distance = this.location.distanceFrom(gameObject.location) ;
          if (distance < min_distance) {
            min_distance = distance
            this.members.target = gameObject.engine_id;
          }
        }
      }
      if (previous_taget != this.members.target) {
        this.call_remote("set_target", [this.members.target])
      }
    }

    fire() {
      this.engine.assetManager.play_audio_once("shot");
    }


    draw () {
        super.draw()
        var barrel_start = $V([0,-4,0]);
        var barrel_end = barrel_start.add(this.members.gun_dir.multiply(10));
        this.engine.context.strokeStyle = "black";
        this.engine.context.lineWidth = 2;
        this.engine.context.beginPath();
        this.engine.context.moveTo(barrel_start.e(1), barrel_start.e(2));
        this.engine.context.lineTo(barrel_end.e(1), barrel_end.e(2));
        this.engine.context.stroke()

    }

    onClick(e) {
      super.onClick(event);
    }

    update (delta_time) {
      var moved = false;
      this.members.fire_cooldown -= delta_time;
      this.engine.cameraPos = $V([
        Math.floor(this.location.e(1)),
        Math.floor(this.location.e(2)),0]);

      this.engine.assetManager.play_audio_loop("amb1");
      if (this.engine.server) {
        this.check_target();
        this.update_gun_dir();
        this.check_fire();
      }

      this.update_velocity();
      this.update_gun_dir();
      if (this.members.velocity.modulus() > 0) {
        moved = true;
        this.location = this.location.add(this.members.velocity.multiply(delta_time));
        if (this.members.velocity.e(1) < 0) this.members.image_identifier = "player_left";
        if (this.members.velocity.e(1) > 0) this.members.image_identifier = "player_right";
      }

      return moved;
    }

    set_target(target) {
      this.members.target = target;
    }

    update_gun_dir () {
      var target = this.engine.objectManager.get_object_by_id(this.members.target);
      if (target) {
        this.members.gun_dir = target.location.subtract(this.location).toUnitVector();
      }
      return;
    }

    update_velocity () {
      return;
      /*
      var v = 0;
      var h = 0;
      if (this.engine.inputManager.up) v -= 1;
      if (this.engine.inputManager.down) v += 1;
      if (this.engine.inputManager.left) h -= 1;
      if (this.engine.inputManager.right) h += 1;
      this.velocity = $V([h,v,0]).toUnitVector().multiply(this.speed);*/
    }

}
