exports.Camera = class {
    constructor (engine) {
        this.engine = engine;
        this.location = $V([0,0,0]);
    }

    setLocation (location) {
        this.location = location;
    }

    x () {
        return this.location.e(1);
    }

    y () {
        return this.location.e(2);
    }

    cameraToWorld (location) {
        return location.add(this.location).subtract($V([this.engine.canvas.width/2, this.engine.canvas.height/2,0]));
    }

    worldToCamera (location) {
        return location.subtract(this.location).add($V([this.engine.canvas.width/2, this.engine.canvas.height/2,0]));
    }

    getViewBounds() {
        return new om.AABB(
            this.x()-this.canvas.width/2,
            this.y()-this.canvas.height/2,
            this.canvas.width,
            this.canvas.height);
    }
};