var ab = require("./aabb.js");
var sylvester = require("sylvester");

exports.GameObject = class {
    constructor (engine, image_identifier, location=$V([0,0,0])) {
        this.engine_id=-1;
        this.object_name = "base_object";
        this.engine = engine;
        this.location = location;
        this.members = {
          ownerID: -1,
          image_identifier: image_identifier,
          rotation: 0,
        }
        this.last_update = new Date().getTime();
        this.light = false;
    }

    to_descriptor() {
        var members = {};
        for (var key in this.members) {
          if (this.members[key] instanceof sylvester.Vector) {
            members[key] = {type: "vec", elements: this.members[key].elements}
          } else {
            members[key] = this.members[key]
          }
        }
        return {
            engine_id: this.engine_id,
            object_name: this.object_name,
            ownerID: this.ownerID,
            location: {type: "vec", elements: this.location.elements},
            members: members
        }
    }

    from_descriptor (description) {
        this.engine_id = description.engine_id;
        this.object_name = description.object_name;
        this.ownerID = description.ownerID;
        this.location = $V(description.location["elements"]);
        for (var key in description.members) {
          if (typeof description.members[key] == "object") {
            if (description.members[key]["type"] == "vec") {
              this.members[key] = $V(description.members[key]["elements"]);
            }
          } else {
            this.members[key] = description.members[key]
          }
        }
    }

    call_remote (method_name, parameters) {
        if (this.engine.server) {
            this.engine.clientManager.broadcast({
                target: "object_manager",
                type: "call_remote",
                engine_id: this.engine_id,
                method: method_name,
                parameters: parameters
            });
        } else if (this.engine.client){
            this.engine.networkManager.send({
                type: "call_remote",
                engine_id: this.engine_id,
                method: method_name,
                parameters: parameters
            });
        }
    }

    recv_remote_call(method_name, parameters) {
        if(this[method_name]) {
            this[method_name].apply(this,parameters);
        }
    }

    clientOwned (userID) {
        return this.ownerID == userID;
    }

    /*
    The indepenentUpdate method is designed to allow the engine to update
    GameObjects outside of the regular tick interval. This could be used
    by the engine to reduce the update rate of some objects which are off
    camera.
     */
    independentUpdate() {
        var current_time = new Date().getTime();
        this.update((current_time - this.last_update)/1000);
    }

    /*
    The Update method is called by the engine and is used to update the state
    of the GameObject. Returns true if the object has moved.
     */
    update (delta_time) {
        return false;
    }

    draw () {
        this.engine.context.translate(this.location.e(1),this.location.e(2));
        this.engine.context.rotate(this.rotation);
        this.engine.assetManager.drawImage(this.members.image_identifier);

        if (this.engine.debug == 1) {
            this.engine.assetManager.drawImageAABB(this.members.image_identifier);
        }
    }

    delete () {
      this.engine.objectManager.delete_object(this);
    }

    getLight () {
        if (this.light) {
            this.light.location = this.location;
            return this.light;
        }
    }

    getAABB () {
        var image = this.engine.assetManager.getImage(this.image_identifier);
        if (image != undefined) {
            var aabb = image.getAABB()
            aabb.x += this.location.e(1);
            aabb.y += this.location.e(2);
            return aabb;
        }
        else {
            throw "where do you want me to get an aabb from?";
            return new ab.AABB(this.location.e(1),this.location.e(2),10,10);
        }
    }

    onClick (event) {

    }

    say (text, time) {
        if (this.engine.server) {
            this.call_remote("say",[text, time]);
        } else {
            var tb = this.engine.guiLayer.TextBox(text,
                this.engine.camera.worldToCamera(this.location.add($V([10, -10, 0]))));
            if (time > 0) {
                setTimeout(function () {
                    tb.delete();
                }, time);
            }
            return tb;
        }

    }
};
