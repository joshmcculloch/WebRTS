class GameObject {
    constructor (engine, image_identifier, location=$V([0,0,0])) {
        this.engine = engine;
        this.image_identifier = image_identifier;
        this.location = location;
        this.rotation = 0;
        this.last_update = new Date().getTime();
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
}