var Engine = require("./engine.js");
var om = require("./objectManager.js");
var go = require("./gameObject.js");
var cc = require("./clientConnection.js");
var gl = require("./guiManager.js");

exports.GameObject = go.GameObject;

exports.ClientEngine = class extends Engine.BaseEngine {
    constructor (canvas_id) {
        super();
        this.canvas = document.getElementById(canvas_id);
        this.context = this.canvas.getContext('2d');
        this.debug = 0;
        //this.connection = new cc.ClientConnection();
        this.guiLayer = new gl.GuiManager(this.canvas);

        this.statsBox = this.guiLayer.TextBox("Render Count: " + this.objectManager.lastRenderCount, $V([10,10]));
        this.statsBox.setLocation($V([10,10]),true);
        this.cameraPos = $V([0,0,0]);
    }

    cameraToWorld (location) {
        return location.add(this.cameraPos).subtract($V([this.canvas.width/2, this.camvas.height/2,0]));
    }

    worldToCamera (location) {
        return location.subtract(this.cameraPos).add($V([this.canvas.width/2, this.canvas.height/2,0]));
    }

    render() {
        var viewVolumeBorder = 100;
        var viewVolume = new om.AABB(
            this.cameraPos.e(1)-this.canvas.width/2-viewVolumeBorder,
            this.cameraPos.e(2)-this.canvas.height/2-viewVolumeBorder,
            this.canvas.width+viewVolumeBorder*2,
            this.canvas.height+viewVolumeBorder*2);

        // Clear the screen
        this.context.fillStyle = "#6495ED";
        this.context.fillRect(0,0,this.canvas.width, this.canvas.height);

        // Save tranformation
        this.context.save();
        // Move screen to camera
        this.context.translate(-this.cameraPos.e(1),-this.cameraPos.e(2));
        //Center camera on screen
        this.context.translate(this.canvas.width/2,this.canvas.height/2);


        this.objectManager.render(viewVolume);
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
        if (this.debug > 2) {
            this.context.save();
            this.context.translate(-this.cameraPos.e(1),-this.cameraPos.e(2));
            this.context.translate(this.canvas.width/2,this.canvas.height/2);
            this.objectManager.debug_draw();
            this.context.restore();
        }

        this.statsBox.updateText("Render Count: " + this.objectManager.lastRenderCount);

        setTimeout(this.update.bind(this),10);
        this.last_update = current_time;
    }

};