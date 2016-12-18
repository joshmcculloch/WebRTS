var om = require("./objectManager.js");
var am = require("./assetManager.js");
var go = require("./gameObject.js");

exports.GameObject = go.GameObject;

exports.BaseEngine = class {
    constructor () {
        this.objectManager = new om.ObjectManager(this);
        this.assetManager = new am.AssetManager(this);
        this.last_update = new Date().getTime()/1000;
        this.debug = 0;
    }

    start() {
        this.update();
    }

    update() {
        var current_time = new Date().getTime()/1000;
        var delta_time = current_time - this.last_update;

        this.objectManager.update(delta_time);

        setTimeout(this.update.bind(this),10);
        this.last_update = current_time;
    }

}


