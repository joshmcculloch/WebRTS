/*
The AssetManager takes care of loading assets from the server and maintains
references to a single instance of each asset to be used by all game objects.
 */
var ab = require("./aabb.js");
exports.AssetManager = class{
    constructor (engine) {
        this.images = {};
        this.audio = {};
        this.engine = engine;

    }

    load_manifest(filename) {
        var xmlhttp = new XMLHttpRequest();
        var self = this;
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var manifest = JSON.parse(this.responseText);
                self.parse_manifest(manifest);
            }
        };

        xmlhttp.open("GET", filename, true);
        xmlhttp.send();
    }

    parse_manifest(manifest) {

        for(let asset of manifest) {
            if (asset["type"] == "image") {
                this.load_image(asset["filename"], asset["reference"], $V([asset.origin.x,asset.origin.y]));
            }
            else if (asset["type"] == "audio") {
                this.load_audio(asset["filename"], asset["reference"]);
            }
        }
    }

    load_image(filename, reference, origin) {
        this.images[reference] =  new exports.Image_Asset(filename, origin, this.engine);

    }

    drawImage(reference) {
        if (this.images[reference]) {
            this.images[reference].draw();
        }
    }

    drawImageAABB(reference) {
        if (this.images[reference]) {
            this.images[reference].drawAABB();
        }
    }

    load_audio(filename, reference) {
        this.audio[reference] =  new Audio(filename);
    }

    getImage(reference) {
        if (this.images[reference]) {
            return this.images[reference];
        }
    }
}

exports.Image_Asset = class {

    constructor (filename, origin, engine) {
        this.origin = origin;
        this.engine = engine;
        this.loaded = false;
        this.aabb = new ab.AABB(0,0,1,1);
        this.image = new Image();
        this.image.src = filename;
        var self = this;
        this.image.onload = function () {
            self.loaded = true;
            self.aabb = new ab.AABB(self.origin.e(1),self.origin.e(2),this.width,this.height);
        }
    }

    getAABB () {
        return new  ab.AABB(this.aabb.x, this.aabb.y, this.aabb.w, this.aabb.h);
    }

    draw() {
        this.engine.context.drawImage(this.image, this.origin.e(1), this.origin.e(2));
    }

    drawAABB() {
        this.engine.context.strokeStyle = "red";
        this.engine.context.fillStyle = "red";
        this.engine.context.fillRect(-4,-4,8,8);
        this.engine.context.strokeRect(this.aabb.x,this.aabb.y,this.aabb.w,this.aabb.h);

    }
}