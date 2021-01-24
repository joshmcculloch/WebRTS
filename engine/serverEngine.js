var go = require("./gameObject.js");

var Engine = require("./engine.js");
var cm = require("./clientManager");
var fs = require('fs');
require("sylvester");

exports.GameObject = go.GameObject;

exports.ServerEngine = class extends Engine.BaseEngine {
    constructor () {
        super();
        this.server = true;
        this.userManager = new cm.UserManager(this);
        this.clientManager = new cm.ClientManager(this, this.userManager);
    }

    saveGameObjects (async=false) {
        var descriptors = [];
        for (let go of this.objectManager.gameObjects) {
            descriptors.push(go.to_descriptor());
        }
        var engine_state = {
          next_engine_id: this.objectManager.next_engine_id
        }
        var json = JSON.stringify(
          {engine_state: engine_state,
          "game_objects": descriptors},
          null,1);
        if (!async) {
            fs.writeFileSync('gamestate.json', json, 'utf8');
        } else {
            fs.writeFile('gamestate.json', json, 'utf8');
        }
    }

    loadGameObjects () {
        if (fs.existsSync('gamestate.json')) {
            try {
                var json = fs.readFileSync('gamestate.json', 'utf8');
                var gamestate = JSON.parse(json);
                var engine_state = gamestate.engine_state
                this.objectManager.next_engine_id = engine_state.next_engine_id;
                var descriptors = gamestate.game_objects
                for (let desc of descriptors) {
                    this.objectManager.create_from_descriptor(desc);
                }
                return true;
            } catch (err) {
                console.log(err);
                return false;
            }
        } else {
            return false;
        }
    }

    start() {
        super.start();
        var self = this;
        process.on('SIGINT', function() {
            console.log("Saving game state...");
            self.saveGameObjects();
            console.log("Done");
            process.exit();
        });
    }


    update() {
        var current_time = new Date().getTime()/1000;
        var delta_time = current_time - this.last_update;
        this.objectManager.update(delta_time);

        setTimeout(this.update.bind(this),50);
        this.last_update = current_time;
    }

};
