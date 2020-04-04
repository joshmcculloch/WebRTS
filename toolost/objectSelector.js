var Engine = require("../engine/clientEngine.js");

exports.ObjectSelector = class extends Engine.GameObject {
    constructor (engine) {
        super (engine, "", $V([1,1,1]));
        this.object_name = "object_selector";
        this.selectedObject = undefined;
        var self = this;
        this.engine.inputManager.registerRightClickHandler(function(event){self.rightClickHandler(event);});
    }

    rightClickHandler(worldLocation, event) {
        console.log("rightCkickHandlerWorking");
        var gameObject = this.engine.objectManager.get_object_at_location(worldLocation);
        if (gameObject && this.selectedObject) {
            this.selectedObject.interact(gameObject);
        }
        
    }

    to_descriptor() {
        var description = super.to_descriptor();
        return description;
    }

    from_descriptor (description) {
        super.from_descriptor(description);
    }

    clear_selection() {
        if (this.selectedObject) {
            this.selectedObject.deselect();
            this.selectedObject = undefined;
        }
    }

    select_object(interactableGameObject) {
        this.clear_selection();
        interactableGameObject.select();
        this.selectedObject = interactableGameObject;
        console.log("Object selector is selecting a new object.");
    }

    onClick(e) {
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

}
