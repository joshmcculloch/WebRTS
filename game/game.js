/*
A Demo application for engine features
Josh McCulloch - October 2016
 */

var Engine = require("../engine/clientEngine.js");
var Sheep = require("./sheep.js");
var Player = require("./player.js");
var go = require("../engine/gameObject.js");
var scene = require("../engine/scene.js");

// Create new engine
var engine = new Engine.ClientEngine("mainCanvas",host="ws://localhost:8080");

// Load the assets manifest
engine.assetManager.load_manifest("game/asset_manifest.json");

var CoreGame = new scene.Scene(engine, function (self) {

    self.objectManager.register_constructor(go.GameObject);
    self.objectManager.register_constructor(Player.Player);
    self.objectManager.register_constructor(Sheep.Sheep);
    // Create Player object
    //var player = new Player.Player(engine, $V([622, 100, 1]));
    //self.objectManager.add_object(player);

    //var s = new Sheep.Sheep(engine, $V([622, 100, 1]));
    //console.log(s.to_descriptor());

    self.engine.networkManager.subscribe();
});

var Menu = new scene.Scene(engine, function (self)  {
    self.objectManager.add_object(new go.GameObject(engine, "welcome", $V([10,10,1])));
    self.engine.guiLayer.Login(function () {engine.switchScene("core");});
    self.engine.camera.location = $V([10,10,0]);
});



engine.registerScene("menu",Menu);
engine.registerScene("core",CoreGame);
engine.switchScene("menu");
// Start Game
engine.start();
