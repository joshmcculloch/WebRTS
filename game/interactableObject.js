var Engine = require("../engine/clientEngine.js");

exports.Interactable = class extends Engine.GameObject {
    constructor (engine, image_identifier, location, selectable=false) {
        super (engine, image_identifier, location);
        this.object_name = "interactable_object";
        this.object_selector = this.engine.objectManager.get_gameObject_by_name("object_selector");
        this.selected = false;
        this.selectable = selectable;
    }

    to_descriptor() {
        var description = super.to_descriptor();
        description.selectable = this.selectable;
        return description;
    }

    from_descriptor (description) {
        super.from_descriptor(description);
        this.selectable = description.selectable;
    }

    deselect() {
        this.selected = false;
    }

    select() {
        this.selected = true;
    }

    onClick(e) {
        if (this.selectable) {
            this.object_selector.select_object(this);
        } else {
            this.object_selector.clear_selection();
        }
        super.onClick(e);
    }

    draw () {
        if (this.selected) {
            var aabb = this.getAABB();
            this.engine.context.style = "red";
            this.engine.context.strokeRect(aabb.x,aabb.y,aabb.w,aabb.h);
        }
        super.draw()
    }

    interact(gameObject) {
        
    }

}
