/*
A Demo application for engine features
Josh McCulloch - October 2016
 */

var Engine = require("../engine/clientEngine.js");
var Sheep = require("./sheep.js");
var Player = require("./player.js");
var go = require("../engine/gameObject.js");

// Create new engine
var engine = new Engine.ClientEngine("mainCanvas");


// Load the assets manifest
engine.assetManager.load_manifest("game/asset_manifest.json");

function CoreGame () {
// Create Player object
    var player = new Player.Player(engine, $V([622, 100, 1]));
    engine.objectManager.add_object(player);

    var s = new Sheep.Sheep(engine, $V([622, 100, 1]));
    console.log(s.to_descriptor());

    engine.objectManager.register_constructor(go.GameObject);
    engine.objectManager.register_constructor(Player.Player);
    engine.objectManager.register_constructor(Sheep.Sheep);

}

function Menu () {
    engine.objectManager.add_object(new go.GameObject(engine, "welcome", $V([10,10,1])));
    engine.guiLayer.Login();
    engine.camera.location = $V([10,10,0]);
}

engine.registerScene("menu",Menu);
engine.registerScene("core",CoreGame);
engine.switchScene("menu");
// Start Game
engine.start();
