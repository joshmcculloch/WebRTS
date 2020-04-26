var Engine = require("../engine/clientEngine.js");
var go = require("../engine/gameObject.js");
var scene = require("../engine/scene.js");
var lm = require("../engine/lightingManager.js");
var zb = require("./zombie.js");
var player = require("./player.js");


// Create new engine
var engine = new Engine.ClientEngine("mainCanvas");

// Load the assets manifest
engine.assetManager.load_manifest("game/asset_manifest.json");

var Splash = new scene.Scene(engine, function (self)  {
    self.engine.camera.location = $V([2000,2000,0]);
    var p = new player.Player(engine, $V([2000,2000,0]))
    self.objectManager.add_object(p);

    for(var i=1500; i<2500; i+=20) {
        self.objectManager.add_object(new zb.Zombie(engine, $V([4000*Math.random(),i,0]), p));
    }


});

engine.registerScene("splash",Splash);
engine.switchScene("splash");
// Start Game
engine.start();
