var go = require("./gameObject.js");

var Engine = require("./engine.js");

exports.GameObject = go.GameObject;

exports.ServerEngine = class extends Engine.BaseEngine {
    constructor () {
        super();
    }

    start() {
        super.start();
    }


    update() {
        var current_time = new Date().getTime()/1000;
        var delta_time = current_time - this.last_update;
        this.updateCanvasSize();
        this.objectManager.update(delta_time);
        
        setTimeout(this.update.bind(this),10);
        this.last_update = current_time;
    }

};