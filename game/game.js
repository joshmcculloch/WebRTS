/*
A Demo application for engine features
Josh McCulloch - October 2016
 */

var Engine = require("../engine/clientEngine.js");
var Cloud = require("./cloud.js");
var Sheep = require("./sheep.js");
var Player = require("./player.js");
var Tree = require("./tree.js");
var Gaia = require("./gaia.js");
var Camera = require("./cameraObject.js");
var iobj = require("./interactableObject.js");
var go = require("../engine/gameObject.js");
var scene = require("../engine/scene.js");
var lm = require("../engine/lightingManager.js");
var selector = require("./objectSelector.js");

// Create new engine
//var engine = new Engine.ClientEngine("mainCanvas",host="ws://game.joshm.cc:8192");
var engine = new Engine.ClientEngine("mainCanvas",host="ws://localhost:8192");

// Load the assets manifest
engine.assetManager.load_manifest("game/asset_manifest.json");

var CoreGame = new scene.Scene(engine, function (self) {
    self.objectManager.add_object(new selector.ObjectSelector(engine));
    self.objectManager.register_constructor(go.GameObject);
    self.objectManager.register_constructor(Player.Player);
    self.objectManager.register_constructor(Sheep.Sheep);
    self.objectManager.register_constructor(Gaia.Gaia);
    self.objectManager.register_constructor(Tree.Tree);
    self.objectManager.register_constructor(iobj.Interactable);
    engine.objectManager.register_constructor(Camera.PlayerCamera);
    self.engine.lightingManager.ambientLight = new lm.LightColour(0,100,0);

    self.engine.networkManager.subscribe();
});

var Menu = new scene.Scene(engine, function (self)  {
    self.objectManager.add_object(new go.GameObject(engine, "welcome", $V([2000,2000,1])));
    for(var i=1500; i<2500; i+=50) {
        self.objectManager.add_object(new Cloud.Cloud(engine, $V([4000*Math.random(),i,0])));
    }
    self.engine.guiLayer.Login(function () {engine.switchScene("core");});
    self.engine.camera.location = $V([2000,2000,0]);

    var window = self.engine.guiLayer.Window("bottom_buttons");
    window.add_button("BUTTON!", ()=>{console.log("BUTTON!")},"");
    window.add_button("BUTTON!", ()=>{console.log("BUTTON!")},"");
    window.add_button("BUTTON!", ()=>{console.log("BUTTON!")},"");
    window.add_button("BUTTON!", ()=>{console.log("BUTTON!")},"");
    console.log("Created window")
});



engine.registerScene("menu",Menu);
engine.registerScene("core",CoreGame);
engine.switchScene("menu");
// Start Game
engine.start();
