var Engine = require("../engine/clientEngine.js");
var go = require("../engine/gameObject.js");
var scene = require("../engine/scene.js");
var lm = require("../engine/lightingManager.js");
var zb = require("./zombie.js");
var player = require("./player.js");
var bullet = require("./bullet.js");
var npc = require("./npc.js");
var lo = require("./logicObject.js");
var bs = require("./bloodsplatter.js");
var sylvester = require("sylvester");

// Create new engine
var engine = new Engine.ClientEngine("mainCanvas",host="ws://localhost:8192");

// Load the assets manifest
engine.assetManager.load_manifest("game/asset_manifest.json");


var Game = new scene.Scene(engine, function (self)  {
    self.engine.camera.location = $V([0,0,0]);
    //var p = new player.Player(engine, $V([2000,2000,0]))
    //self.objectManager.add_object(p);

    self.engine.objectManager.register_constructor(zb.Zombie);
    self.engine.objectManager.register_constructor(npc.NPC);
    self.engine.objectManager.register_constructor(bullet.Bullet);
    self.engine.objectManager.register_constructor(bs.BloodSplatter);
    self.engine.networkManager.subscribe();
});

var Menu = new scene.Scene(engine, function (self)  {
    self.engine.guiLayer.Login(function () {engine.switchScene("game");});

    var window = self.engine.guiLayer.Window("bottom_buttons");
    window.add_button("BUTTON!", ()=>{console.log("BUTTON!")},"");
    window.add_button("BUTTON!", ()=>{console.log("BUTTON!")},"");
    window.add_button("BUTTON!", ()=>{console.log("BUTTON!")},"");
    window.add_button("BUTTON!", ()=>{console.log("BUTTON!")},"");
    console.log("Created window")
});

var Splash = new scene.Scene(engine, function (self)  {
  self.objectManager.add_object(new lo.LogicObject(engine,
    ()=>{return self.engine.networkManager.connected()},
    ()=>{engine.switchScene("menu");}));
});

engine.registerScene("splash",Splash);
engine.registerScene("menu",Menu);
engine.registerScene("game",Game);
engine.switchScene("splash");
// Start Game
engine.start();
