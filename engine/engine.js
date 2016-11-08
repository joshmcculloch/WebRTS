var om = require("./objectManager.js");
var im = require("./inputManager.js");
var am = require("./assetManager.js");
var go = require("./gameObject.js");

exports.GameObject = go.GameObject;

exports.Engine = class {
    constructor (canvas_id) {
        this.objectManager = new om.ObjectManager(this);
        this.assetManager = new am.AssetManager(this);
        this.inputManager = new im.InputManager(this);
        this.canvas = document.getElementById(canvas_id);
        this.context = this.canvas.getContext('2d');
        this.last_update = new Date().getTime()/1000;
        this.debug = false;
    }

    start() {
        this.update();
    }

    render() {

        this.context.save();
        this.context.fillStyle = "#6495ED";
        this.context.fillRect(0,0,this.canvas.width, this.canvas.height);
        this.objectManager.render();
        this.context.restore();
    }

    updateCanvasSize(width,height) {
        this.canvas.width  = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    update() {
        var current_time = new Date().getTime()/1000;
        var delta_time = current_time - this.last_update;
        this.updateCanvasSize();
        this.objectManager.update(delta_time);
        this.render();
        if (this.debug > 1) {
            this.objectManager.debug_draw();
        }
        setTimeout(this.update.bind(this),10);
        this.last_update = current_time;
    }

}


