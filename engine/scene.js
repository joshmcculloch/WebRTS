/**
 * Created by Josh on 4/03/2017.
 */
var om = require("./objectManager.js");

exports.Scene = class {
    constructor (engine, setupFunction) {
        this.objectManager = new om.ObjectManager(engine);
        this.engine = engine;
        this.setupFunction = setupFunction;
    }

    switchScene () {
        this.setupFunction(this);
    }

};