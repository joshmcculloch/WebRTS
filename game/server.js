#!/usr/bin/env node
var Engine = require("../engine/serverEngine");
var Sheep = require("./sheep.js");
var Camera = require("./cameraObject.js");
var Gaia = require("./gaia.js");
var Player = require("./player.js");
var iobj = require("./interactableObject.js");
var go = require("../engine/gameObject.js");
var Tree = require("./tree.js");

var engine = new Engine.ServerEngine();

engine.objectManager.register_constructor(go.GameObject);
engine.objectManager.register_constructor(iobj.Interactable);
engine.objectManager.register_constructor(Player.Player);
engine.objectManager.register_constructor(Sheep.Sheep);
engine.objectManager.register_constructor(Gaia.Gaia);
engine.objectManager.register_constructor(Camera.PlayerCamera);
engine.objectManager.register_constructor(Tree.Tree);

engine.clientManager.onSignup = function (engine, userID) {
    var player = new Player.Player(engine, $V([300, 300, 1]));
    player.ownerID = userID;
    engine.objectManager.add_object(player);

    var camera = new Camera.PlayerCamera(engine, $V([300, 300, 1]));
    camera.ownerID = userID;
    engine.objectManager.add_object(camera);
};

if (!engine.loadGameObjects()) {
    console.log("Setting up new world");

    engine.objectManager.add_object(new Gaia.Gaia(engine, $V([1, 1, 1])));

// Create trees
    for (var i = 0; i < 200; i++) {
        var tree = new Tree.Tree(engine, $V([
            Math.floor(Math.random() * 2800 + 100),
            Math.floor(Math.random() * 2800 + 100),
            1
        ]));
        tree.age = Math.random()*3600*15;
        engine.objectManager.add_object(tree);
    }

// Create Sheep
    for (var i = 0; i <= 500; i++) {
        engine.objectManager.add_object(new Sheep.Sheep(engine, $V([Math.random() * 2800 + 100, Math.random() * 2800 + 100, 1])));
    }

    engine.objectManager.add_object(new iobj.Interactable(engine, "house", $V([500, 500, 1]), true));

    for (var x = 0; x < 3000; x += 50) {
        for (var y = 0; y < 3000; y += 50) {
            if (Math.random() > 0.3) {
                engine.objectManager.add_object(new iobj.Interactable(engine, "grass", $V([x, y, 0])));
            } else {
                engine.objectManager.add_object(new iobj.Interactable(engine, "dirt", $V([x, y, 0])));
            }
        }

    }
}

engine.start();
