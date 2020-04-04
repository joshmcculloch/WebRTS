var Engine = require("../engine/clientEngine.js");
var iobj = require("./interactableObject.js");

class Tree extends iobj.Interactable {
    constructor (engine, location) {
        super (engine, "tree1",location, true);
        this.engine_id=-1;
        this.object_name = "tree_object";
        this.age = 0;
    }

    to_descriptor() {
        var description = super.to_descriptor();
        description.age = this.age;
        return description;
    }

    from_descriptor (description) {
        super.from_descriptor(description);
        this.age = description.age;
    }

    update (delta_time) {

        this.age += delta_time;
        if (this.age < 3600){
            this.image_identifier = "tree1";
        } else if (this.age < 3600*2) {
            this.image_identifier = "tree2";
        }
        else if (this.age < 3600*10) {
            this.image_identifier = "tree3";
            if (this.engine.server) {
                if (Math.random() * 1200  < delta_time) {

                    this.spawnTree();
                }
            }
        }
        else if (this.age < 3600*24) {
            this.image_identifier = "tree4";
            
        }
        else {
            this.age = 0;
            this.image_identifier = "tree1";
        }
        var moved = false;
        return moved;
    }
    
    spawnTree () {
        var new_location = this.location.add($V([Math.random()*200-100,Math.random()*200-100,0]));
        if (!this.engine.objectManager.inWorld(new_location)) {
            console.log("new location out of world");
            return;
        }

        var neighbours  = this.engine.objectManager.get_neighbours(new_location, 50);

        var objInRange = 0
        for(var i=0;i< neighbours.length; i++) {
            if (neighbours[i].location.e(3) == 1) {
                objInRange++;
            }
        }
        if (objInRange == 0) {
            console.log("Spawning tree: success");
            var tree = new Tree(this.engine, new_location)
            this.engine.objectManager.add_object(tree);
        } else {
            console.log("Spawning tree: fail", objInRange);
        }

    }

}

exports.Tree = Tree;