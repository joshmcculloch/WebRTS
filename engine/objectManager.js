/*
The ObjectManager keeps track of all current GameObjects. 
 */
exports.ObjectManager = class {
    constructor (engine) {
        this.engine = engine;
        this.cells = new Cell(1, new AABB(-100,-100, 1000, 1000), undefined, 10);
        this.gameObjects = [];
    }
    add_object (gameObject) {
        this.gameObjects.push(gameObject);
        this.cells.insert(gameObject);
    }

    render() {
        this.cells.render(this.engine.context, 0); // Render layer 1
        this.cells.render(this.engine.context, 1); // Render layer 2
    }

    update(delta_time) {
        this.cells.update(delta_time);
        this.cells.clean();
        this.cells.cull();
    }

    debug_draw() {
        this.cells.debug_draw(this.engine.context);

    }

    get_neighbours(location, distance) {
        return this.cells.get_neighbours(location, distance);
    }


}

class AABB {

    constructor(x,y,w,h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    is_inside(p) {
        if (this.x <= p.e(1) && p.e(1) < (this.x + this.w) &&
            this.y <= p.e(2) && p.e(2) < (this.y + this.h)) {
            return true;
        } else {
            return false;
        }
    }

    ne () {
        return new AABB(this.x+this.w/2,this.y, this.w/2, this.h/2);
    }

    se () {
        return new AABB(this.x+this.w/2,this.y+this.h/2, this.w/2, this.h/2);
    }

    nw () {
        return new AABB(this.x,this.y, this.w/2, this.h/2);
    }

    sw () {
        return new AABB(this.x,this.y+this.h/2, this.w/2, this.h/2);
    }
}

class Cell {

    constructor (max_objects, aabb, parent, min_size, dirty=false) {
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
        this.checked = false;
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

    render(context, layer) {
        if (this.leaf) {
            for(let gameObject of this.gameObjects) {
                if (gameObject.location.e(3) == layer) {
                    context.save();
                    gameObject.draw();
                    context.restore();
                }
            }
        } else {
            this.nw.render(context, layer);
            this.ne.render(context, layer);
            this.sw.render(context, layer);
            this.se.render(context, layer);


        }
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

        if (this.checked) {
            context.fillStyle = "rgba(0,255,0,1)";
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
        this.checked = false;
        if (this.distance_from(location) < distance) {

            if (this.leaf) {
                this.checked = true;
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
