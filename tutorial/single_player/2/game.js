var Engine = require("../engine/clientEngine.js");
var go = require("../engine/gameObject.js");
var scene = require("../engine/scene.js");
var lm = require("../engine/lightingManager.js");
var ball = require("./ball.js");


// Create new engine
var engine = new Engine.ClientEngine("mainCanvas");

// Load the assets manifest
engine.assetManager.load_manifest("game/asset_manifest.json");

var Splash = new scene.Scene(engine, function (self)  {
    for(var i=000; i<4000; i+=10) {
        self.objectManager.add_object(new ball.Ball(engine, $V([4000*Math.random(),i,0])));
    }
    self.engine.camera.location = $V([2000,2000,0]);
});

engine.registerScene("splash",Splash);
engine.switchScene("splash");
// Start Game
engine.start();
