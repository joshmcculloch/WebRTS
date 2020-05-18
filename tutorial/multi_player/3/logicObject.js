var Engine = require("../engine/clientEngine.js");
var ab = require("../engine/aabb.js");

exports.LogicObject = class extends Engine.GameObject {
    constructor (engine, condition, on_true, on_false=undefined) {
      super (engine, "ball",$V([0,0,0]), true);
      this.condition = condition;
      this.on_true = on_true;
      this.on_false = on_false;
    }

    update (delta_time) {
      if (this.condition()) {
        if (this.on_true !== undefined) {
          this.on_true()
        }
      } else {
        if (this.on_false !== undefined) {
          this.on_false()
        }
      }
      return false
    }

    getAABB () {
      return new ab.AABB(this.location.e(1),this.location.e(2),10,10);
    }
};
