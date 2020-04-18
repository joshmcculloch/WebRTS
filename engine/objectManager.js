/*
The ObjectManager keeps track of all current GameObjects.
 */
var ab = require("./aabb.js");
exports.ObjectManager = class {

    constructor (engine) {
        this.engine = engine;
        //this.storage_engine = new Cell(1, new ab.AABB(-100,-100, 5000, 5000), undefined, 10);
        this.storage_engine = new SparseGrid(500);
        this.object_library = {};
        this.gameObjects = [];
        this.lastRenderCount = 0;
        this.next_engine_id = 0;
        this.id_to_objects = {};
        this.to_delete = new Set();
    }

    get_object_by_id(id) {
        if (id >=0 && this.id_to_objects[id]) {
            return this.id_to_objects[id];
        } else {
            return false;
        }
    }

    register_constructor (engine_class) {
        var obj = new engine_class(this.engine);
        this.object_library[obj.object_name]  = engine_class;
    }
    create_from_descriptor (description) {
        if (this.object_library[description.object_name]) {
            var obj  = new this.object_library[description.object_name](this.engine);
            obj.from_descriptor(description);
            this.add_object(obj);
        }
    }

    add_object (gameObject) {
        if (this.engine.server && gameObject.engine_id == -1) {
            gameObject.engine_id = this.next_engine_id++;
            this.engine.clientManager.broadcast({
                target: "object_manager",
                type: "instansiate",
                descriptor: gameObject.to_descriptor()
            });

        } else {
        }

        if (gameObject.engine_id != -1) {
            this.id_to_objects[gameObject.engine_id] = gameObject;
        }

        this.gameObjects.push(gameObject);
        //throw "Under lying data structure not implemented"
        this.storage_engine.insert(gameObject);
    }

    delete_object (gameObject) {
      /* Adds a gameObject to the collection that will be deleted at the
      end of the next update
      */
      this.to_delete.add(gameObject);
    }

    _delete_object (gameObject) {
      /* An internal method for deleting a gameObject*/
      if (this.engine.server && gameObject.engine_id == -1) {
          this.engine.clientManager.broadcast({
              target: "object_manager",
              type: "delete",
              descriptor: gameObject.to_descriptor()
          });
      } else {
      }

      if (gameObject.engine_id != -1) {
        delete this.id_to_objects[gameObject.engine_id];
      }

      var index = this.gameObjects.indexOf(gameObject);
      if (index > -1) {
        this.gameObjects.splice(index, 1);
      } else {
        throw "Unable to find gameObject to delete";
      }

      this.storage_engine.remove(gameObject);
    }

    render (viewVolume) {
        var renderCount = 0;
        renderCount += this.storage_engine.render(this.engine.context, 0, viewVolume); // Render layer 1
        renderCount += this.storage_engine.render(this.engine.context, 1, viewVolume); // Render layer 2
        this.lastRenderCount = renderCount;
    }

    update(delta_time) {
        this.storage_engine.update(delta_time);
        if (this.storage_engine instanceof Cell) {
          this.storage_engine.clean();
          this.storage_engine.cull();
        }

        for(let gameObject of this.to_delete) {
          this._delete_object(gameObject);
        }
        this.to_delete = new Set();
    }

    clear() {
        this.storage_engine = new Cell(1, new ab.AABB(-100,-100, 5000, 5000), undefined, 10);
        this.gameObjects = [];
        this.id_to_objects = {};
    }

    debug_draw() {
        this.storage_engine.debug_draw(this.engine.context);

    }

    get_neighbours(location, distance) {
        return this.storage_engine.get_neighbours(location, distance);
    }

    call_remote(object_id, method_name, parameters) {
        //console.log("Found object being called", this.id_to_objects[object_id]);
        if (this.id_to_objects[object_id]) {
            this.id_to_objects[object_id].recv_remote_call(method_name, parameters);
        } else {
            console.log("Object Not Found", object_id);
        }
    }

    get_gameObject_by_name(name){
        for(let gameObject of this.gameObjects) {
            if (gameObject.object_name == name) {
                return gameObject;
            }
        }
        return false;
    }

    get_gameObjects_by_name(name){
        var gameObjects = [];
        for(let gameObject of this.gameObjects) {
            if (gameObject.object_name == name) {
                gameObjects.push(gameObject);
            }
        }
        return gameObjects;
    }

    get_object_at_location(worldLocation) {
        var maxY = 0;
        var maxLayer = 0;
        var selectedGameObject = false;
        for (let gameObject of this.get_neighbours(worldLocation, 200)) {

            if (gameObject.getAABB().is_inside(worldLocation)) {
                if ((gameObject.location.e(2) > maxY && gameObject.location.e(3) == maxLayer )
                    || gameObject.location.e(3) > maxLayer) {
                    selectedGameObject = gameObject;
                    maxY = selectedGameObject.location.e(2);
                    maxLayer = selectedGameObject.location.e(3);
                }
            }
        }
        return selectedGameObject;
    }

    inWorld(location) {
        return this.storage_engine.in_cell(location);
    }

};

class StorageEngine {

    constructor () {
    }

    insert (gameObject) {
      throw "Under lying data structure not implemented"
    }

    render (layer, viewVolume) {
      throw "Under lying data structure not implemented"
    }

    update (delta_time) {
      throw "Under lying data structure not implemented"
    }

    get_neighbours(location, distance) {
      throw "Under lying data structure not implemented"
    }

    remove(gameObject) {
      throw "Under lying data structure not implemented"
    }
}

class SparseGrid extends StorageEngine {

    constructor (cell_size) {
      super();
      this.cell_size = cell_size;
      this.cells = {};
      this.gameObjects = new Set();
    }

    clear() {
      this.cells = {};
      this.gameObjects = new Set();
    }

    location_to_cell_key(location) {
      var cell_x = Math.floor(location.e(1)/this.cell_size)
      var cell_y = Math.floor(location.e(2)/this.cell_size)
      return [cell_x,cell_y]
    }

    insert (gameObject) {
      var key = this.location_to_cell_key(gameObject.location);
      if (!(key in this.cells)) {
        this.cells[key] = [];
      }
      this.cells[key].push(gameObject);
      this.gameObjects.add(gameObject);
    }

    remove (gameObject) {
      var key = this.location_to_cell_key(gameObject.location);
      if (key in this.cells) {
        var index = this.cells[key].indexOf(gameObject);
        if (index > -1) {
          this.cells[key].splice(index, 1);
        } else {
          throw "This game obejct does not exist in the cell it was expected";
        }
      } else {
        throw "There is no cell where this object should exist";
      }
      this.gameObjects.delete(gameObject);
    }

    render (context, layer, viewVolume) {
      var top   = Math.floor((viewVolume.y)/this.cell_size);
      var bottom = Math.floor((viewVolume.y + viewVolume.h + this.cell_size)/this.cell_size);
      var left  = Math.floor((viewVolume.x)/this.cell_size);
      var right = Math.floor((viewVolume.x + viewVolume.w + this.cell_size)/this.cell_size);

      var renderCount = 0;
      for (var y=top; y<=bottom;y++) {
        for (var x=left;x<=right;x++) {
          if ([x,y] in this.cells) {
            for(let gameObject of this.cells[[x,y]]) {
              if (gameObject.location.e(3) == layer) {
                renderCount++;
                context.save();
                gameObject.draw();
                context.restore();
                //gameObject.engine.lightingManager.addLight(gameObject.getLight());
              }
            }
          }
        }
      }
      return renderCount;
    }

    update (delta_time) {
        for (let gameObject of this.gameObjects) {

          var init_key = this.location_to_cell_key(gameObject.location);
          if (this.cells[init_key].indexOf(gameObject) == -1) {
            throw "GameObject not in expected cell, did it move outside of it's update method?";
          }
          gameObject.update(delta_time)
          var updated_key = this.location_to_cell_key(gameObject.location);

          // if update the gameobjects cell if it has moved outside its initial one
          if (init_key[0] != updated_key[0] ||  init_key[1] != updated_key[1]) {

            // if the new cell doesn't exsist, create it
            if (!(updated_key in this.cells)) {
              this.cells[updated_key] = [];
            }
            var index = this.cells[init_key].indexOf(gameObject);
            if (index > -1) {
              this.cells[init_key].splice(index, 1);
              this.cells[updated_key].push(gameObject);
            }
            else {
              throw "Unable to find gameobjects in initial cell";
            }
          }
        }
    }

    get_neighbours(location, distance) {
      var top    = Math.floor((location.e(2) - distance)/this.cell_size);
      var bottom = Math.floor((location.e(2) + distance)/this.cell_size);
      var left   = Math.floor((location.e(1) - distance)/this.cell_size);
      var right  = Math.floor((location.e(1) + distance)/this.cell_size);
      var gameObjects = [];
      for (var y=top; y<=bottom;y++) {
        for (var x=left;x<=right;x++) {
          if ([x,y] in this.cells) {
            for(let gameObject of this.cells[[x,y]]) {
              if (gameObject.location.subtract(location).modulus() < distance) {
                gameObjects.push(gameObject);
              }
            }
          }
        }
      }
      return gameObjects;
    }
}


class Cell extends StorageEngine {
    /* Despite the name "Cell" this is actually a quad tree*/

    constructor (max_objects, aabb, parent, min_size, dirty=false) {
        super();
        this.parent = parent;
        this.max_objects = max_objects;
        this.min_size = min_size;
        this.leaf = true;
        this.aabb = aabb;
        this.gameObjects = [];
        this.ne = undefined;
        this.se = undefined;
        this.nw = undefined;
        this.sw = undefined;
        this.dirty = dirty;  // If any of the cells gameObjects move the cell is marked as dirty
        this.error = false;
    }

    in_cell(location) {
        return this.aabb.is_inside(location);
    }

    insert (gameObject) {

        // Check if the gameObject belongs in this cell, if not try to insert in parent.
        // This allows us to attempt to insert close to were it belongs, allowing it to traverse
        // up and down the tree to the correct location
        if (!this.aabb.is_inside(gameObject.location)) {
            this.parent.insert(gameObject);
        }
        else if (this.leaf) {

            if (this.gameObjects.length < this.max_objects || this.aabb.w/2 < this.min_size) {
                this.gameObjects.push(gameObject);
            } else {
                //console.log(this.aabb.w/2, this.min_size );
                //console.log(this.aabb.w/2 < this.min_size);

                this.ne = new Cell(this.max_objects, this.aabb.ne(), this, this.min_size, this.dirty);
                this.se = new Cell(this.max_objects, this.aabb.se(), this, this.min_size, this.dirty);
                this.nw = new Cell(this.max_objects, this.aabb.nw(), this, this.min_size, this.dirty);
                this.sw = new Cell(this.max_objects, this.aabb.sw(), this, this.min_size, this.dirty);

                this.leaf = false;
                this.dirty = false;

                for(let go of this.gameObjects) {
                    this.insert(go);
                }
                this.gameObjects = [];
                this.insert(gameObject);
            }
        } else {
            if (this.ne.in_cell(gameObject.location)) {
                this.ne.insert(gameObject);
            } else if (this.se.in_cell(gameObject.location)) {
                this.se.insert(gameObject);
            } else if (this.nw.in_cell(gameObject.location)) {
                this.nw.insert(gameObject);
            } else if (this.sw.in_cell(gameObject.location)) {
                this.sw.insert(gameObject);
            } else {
                console.log(gameObject.location);
                console.log(this);
                throw "cell not found";
            }
        }
    }

    render(context, layer, viewVolume) {
        var renderCount = 0;
        if (viewVolume !== undefined && !this.aabb.is_overlap(viewVolume)){
            //Skip because outside viewVolume
            return renderCount;
        }
        if (this.leaf) {
            for(let gameObject of this.gameObjects) {
                if (gameObject.location.e(3) == layer) {
                    renderCount++;
                    context.save();
                    gameObject.draw();
                    context.restore();
                    gameObject.engine.lightingManager.addLight(gameObject.getLight());
                }
            }
        }
        else {
            renderCount += this.nw.render(context, layer, viewVolume);
            renderCount += this.ne.render(context, layer, viewVolume);
            renderCount += this.sw.render(context, layer, viewVolume);
            renderCount += this.se.render(context, layer, viewVolume);


        }
        return renderCount;
    }

    update(delta_time) {
        if (this.leaf) {
            for(let gameObject of this.gameObjects) {
                if (gameObject.update(delta_time)) {
                    this.dirty = true;
                }
            }
            if (this.gameObjects.length > 1 && this.dirty) {
                this.gameObjects.sort(function(a,b) {
                    if (a.location.e(2) != b.location.e(2)) {
                        return a.location.e(2) - b.location.e(2);
                    } else {
                        return a.location.e(1) - b.location.e(1);
                    }
                });
            }
        } else {
            this.nw.update(delta_time);
            this.ne.update(delta_time);
            this.sw.update(delta_time);
            this.se.update(delta_time);
        }
    }

    debug_draw(context) {
        if (!this.leaf) {

            context.strokeStyle = "red";
            context.beginPath();
            context.moveTo(this.aabb.x+this.aabb.w/2, this.aabb.y);
            context.lineTo(this.aabb.x+this.aabb.w/2, this.aabb.y+this.aabb.h);
            context.moveTo(this.aabb.x, this.aabb.y+this.aabb.h/2);
            context.lineTo(this.aabb.x+this.aabb.w, this.aabb.y+this.aabb.h/2);
            context.stroke()

            this.nw.debug_draw(context);
            this.ne.debug_draw(context);
            this.sw.debug_draw(context);
            this.se.debug_draw(context);
        } else {
            if (this.gameObjects.length > 0) {

                context.fillStyle = "rgba(255,0,0,0.3)";
                context.fillRect(this.aabb.x,this.aabb.y, this.aabb.w, this.aabb.h);
            }
        }
        if (this.error) {
            context.fillStyle = "rgba(255,0,0,1)";
            context.fillRect(this.aabb.x,this.aabb.y, this.aabb.w, this.aabb.h);
        }
    }

    clean () {
        if (this.dirty && !this.leaf) {
            //console.log(this);
            throw "node dirty and not leaf";
            this.dirty = false;
            this.error = true;
        }
        if (!this.leaf) {
            this.nw.clean();
            this.ne.clean();
            this.sw.clean();
            this.se.clean();

        } else if (this.dirty) {
            for(let gameObject of this.gameObjects.slice()) {
                if (!this.aabb.is_inside( gameObject.location)) {
                    // Game object has moved out of this cell
                    var index = this.gameObjects.indexOf(gameObject);
                    if (index < 0) {
                        throw "Can't find gameObject to move out of cell";
                    }
                    this.gameObjects.splice(index, 1);
                    //try insert into parent
                    this.parent.insert(gameObject);
                }
            }
            this.dirty = false;
        }
    }

    cull () {
        if (this.leaf) {
            return this.gameObjects.length;
        } else {
            var gameObjectCount = this.nw.cull();
            gameObjectCount += this.ne.cull();
            gameObjectCount += this.sw.cull();
            gameObjectCount += this.se.cull();
            if (gameObjectCount <= this.max_objects) {
                this.leaf = true;
                this.gameObjects = this.gameObjects.concat(this.nw.gameObjects);
                this.nw = undefined;

                this.gameObjects = this.gameObjects.concat(this.ne.gameObjects);
                this.ne = undefined;

                this.gameObjects = this.gameObjects.concat(this.se.gameObjects);
                this.se = undefined;

                this.gameObjects = this.gameObjects.concat(this.sw.gameObjects);
                this.sw = undefined;
                if (gameObjectCount != this.gameObjects.length) {
                    console.log(gameObjectCount);
                    console.log(this);
                    throw "object lost";
                }
            }
            return gameObjectCount;
        }
    }

    distance_from(location) {
        var radius = Math.sqrt(
            Math.pow(this.aabb.w/2,2)+
            Math.pow(this.aabb.h/2,2));
        var center = $V([this.aabb.x+this.aabb.w/2, this.aabb.y+this.aabb.h/2,1]);
        return center.subtract(location).modulus() - radius;
    }

    get_neighbours(location, distance) {
        var gameObjects = [];
        if (this.distance_from(location) < distance) {

            if (this.leaf) {
                for(let gameObject of this.gameObjects) {
                    if (gameObject.location.subtract(location).modulus() < distance) {
                        gameObjects.push(gameObject);
                    }
                }
            } else {
                gameObjects = gameObjects.concat(this.ne.get_neighbours(location,distance));
                gameObjects = gameObjects.concat(this.se.get_neighbours(location,distance));
                gameObjects = gameObjects.concat(this.nw.get_neighbours(location,distance));
                gameObjects = gameObjects.concat(this.sw.get_neighbours(location,distance));
            }
        }
        return gameObjects;
    }
}
