var Engine = require("../engine/clientEngine.js");
var lm = require("../engine/lightingManager.js");
var go = require("../engine/gameObject.js");
var bullet = require("./bullet.js");
var ball = require("./ball.js");
var syl = require("sylvester");

exports.Player = class extends go.GameObject {


    constructor (engine, location) {
        super (engine, "player_left", location, true);
        this.object_name = "player_object";
        this.speed = 100;
        this.velocity = $V([0,0,0]);
        this.gun_dir = $V([1,0,0]);
        this.firing = false;
        this.spread = 0.5;

        this.engine.cameraPos = $V([
            Math.floor(this.location.e(1)),
            Math.floor(this.location.e(2)),0]);

        this.light = new lm.Light(new lm.LightColour(247, 215, 54), 200, this.location);
        this.selectable = true;
    }


    check_fire() {
      if (this.engine.inputManager.mouseLeftDown && !this.firing) {
        this.firing = true;
        this.engine.assetManager.play_audio_once("shot");

        //this.engine.objectManager.add_object(new bullet.Bullet(this.engine,this.location, this.gun_dir));
        var barrel_start = $V([0,-4,0]);
        var barrel_end = barrel_start.add(this.gun_dir.multiply(10));

        for (var i=0; i<10; i++) {
          var spdir = $V([(Math.random()-0.5)*this.spread, (Math.random()-0.5)*this.spread, 0])
          var bullet_dir = this.gun_dir.add(spdir)
          var b = new bullet.Bullet(this.engine, this.location.add(barrel_end), bullet_dir.multiply(800));
          this.engine.objectManager.add_object(b);
        }


      }
      if (!this.engine.inputManager.mouseLeftDown) {
        this.firing = false;
        //this.engine.assetManager.stop_audio_loop("amb1");
      }
    }


    draw () {
        super.draw()
        var barrel_start = $V([0,-4,0]);
        var barrel_end = barrel_start.add(this.gun_dir.multiply(10));
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
        this.engine.assetManager.play_audio_loop("amb1");
        this.check_fire()
        var moved = false;
        this.update_velocity();
        this.update_gun_dir();
        if (this.velocity.modulus() > 0) {
          moved = true;
          this.location = this.location.add(this.velocity.multiply(delta_time));
          if (this.velocity.e(1) < 0) this.image_identifier = "player_left";
          if (this.velocity.e(1) > 0) this.image_identifier = "player_right";
        }

        return moved;
    }

    update_gun_dir () {
      var mousePos = this.engine.camera.cameraToWorld(this.engine.inputManager.mousePos);
      this.gun_dir = mousePos.subtract(this.location).toUnitVector();
    }

    update_velocity () {
      var v = 0;
      var h = 0;
      if (this.engine.inputManager.up) v -= 1;
      if (this.engine.inputManager.down) v += 1;
      if (this.engine.inputManager.left) h -= 1;
      if (this.engine.inputManager.right) h += 1;
      this.velocity = $V([h,v,0]).toUnitVector().multiply(this.speed);
    }

}
