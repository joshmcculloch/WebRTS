var Engine = require("./engine.js");
var om = require("./objectManager.js");
var go = require("./gameObject.js");
var gl = require("./guiManager.js");
var im = require("./inputManager.js");
var cam = require("./camera.js");
var ab = require("./aabb.js");
var nm = require("./networkManager.js");

exports.GameObject = go.GameObject;

exports.ClientEngine = class extends Engine.BaseEngine {
    constructor (canvas_id) {
        super();
        this.canvas = document.getElementById(canvas_id);
        this.context = this.canvas.getContext('2d');
        this.debug = 0;

        this.networkManager = new nm.NetworkManager(this);
        this.inputManager = new im.InputManager(this);
        this.guiLayer = new gl.GuiManager(this, this.canvas);
        //this.connection = new cc.ClientConnection();

        this.statsBox = this.guiLayer.TextBox("Render Count: " + this.objectManager.lastRenderCount, $V([10,10]));
        this.statsBox.setLocation($V([10,10]),true);
        this.camera = new cam.Camera(this);

        this.scenes = {};
        this.client = true;
    }

    registerScene(name, scene) {
        this.scenes[name] = scene;
    }

    switchScene(name) {
        console.log("Switching scene");
        console.log("Disposing of ",this.objectManager.gameObjects.length," gameobjects");
        //this.objectManager.clear();
        console.log(this.scenes);
        console.log(name);
        this.objectManager = this.scenes[name].objectManager;
        this.scenes[name].switchScene();

    }

    render() {
        var viewVolumeBorder = 100;
        var viewVolume = new ab.AABB(
            this.camera.x()-this.canvas.width/2-viewVolumeBorder,
            this.camera.y()-this.canvas.height/2-viewVolumeBorder,
            this.canvas.width+viewVolumeBorder*2,
            this.canvas.height+viewVolumeBorder*2);

        // Clear the screen
        this.context.fillStyle = "#6495ED";
        this.context.fillRect(0,0,this.canvas.width, this.canvas.height);

        // Save tranformation
        this.context.save();
        // Move screen to camera
        this.context.translate(-this.camera.x(),-this.camera.y());
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
            this.context.translate(-this.camera.x(),-this.camera.y());
            this.context.translate(this.canvas.width/2,this.canvas.height/2);
            this.objectManager.debug_draw();
            this.context.restore();
        }

        this.statsBox.updateText("Render Count: " + this.objectManager.lastRenderCount + "<br/>"+
            "Mouse: ("+this.inputManager.mousePos.e(1)+","+this.inputManager.mousePos.e(2)+")");

        setTimeout(this.update.bind(this),10);
        this.last_update = current_time;
    }

};