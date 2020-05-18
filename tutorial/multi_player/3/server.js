#!/usr/bin/env node
var Engine = require("../engine/serverEngine");


//var Player = require("./player.js");
var NPC = require("./npc.js");
var Zombie = require("./zombie.js");
var Bullet = require("./bullet.js");

var go = require("../engine/gameObject.js");

var engine = new Engine.ServerEngine();

engine.objectManager.register_constructor(go.GameObject);
//engine.objectManager.register_constructor(Player.Player);
engine.objectManager.register_constructor(NPC.NPC);
engine.objectManager.register_constructor(Zombie.Zombie);

engine.clientManager.onSignup = function (engine, userID) {
    /*var player = new Player.Player(engine, $V([300, 300, 1]));
    player.ownerID = userID;
    engine.objectManager.add_object(player);*/
};

if (!engine.loadGameObjects()) {
    console.log("Setting up new world");

    for(var i=-250; i<250; i+=10) {
        engine.objectManager.add_object(new Zombie.Zombie(engine, $V([-500,i,0]), undefined));
    }

    /*for(var i=-400; i<=400; i+=200) {
      var npc = new NPC.NPC(engine,$V([0,i,0]));
      engine.objectManager.add_object(npc);
    }*/

    var npc = new NPC.NPC(engine,$V([0,0,0]));
    engine.objectManager.add_object(npc);

}

engine.start();
