exports.GameObject = class {
    constructor (engine, image_identifier, location=$V([0,0,0])) {
        this.engine_id=-1;
        this.ownerID = -1;
        this.object_name = "base_object";
        this.engine = engine;
        this.image_identifier = image_identifier;
        this.location = location;
        this.rotation = 0;
        this.last_update = new Date().getTime();
    }

    to_descriptor() {
        return {
            engine_id: this.engine_id,
            object_name: this.object_name,
            image_identifier: this.image_identifier,
            ownerID: this.ownerID,
            location: {
                x: this.location.e(1),
                y: this.location.e(2),
                z: this.location.e(3)
            },
            rotation: this.rotation
        }
    }

    from_descriptor (description) {
        this.engine_id = description.engine_id;
        this.object_name = description.object_name;
        this.image_identifier = description.image_identifier;
        this.ownerID = description.ownerID;
        this.location = $V([
            description.location.x,
            description.location.y,
            description.location.z])
        this.rotation = description.rotation;
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
        this.engine.assetManager.drawImage(this.image_identifier);
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