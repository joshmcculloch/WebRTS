/*
The InputManager is used to keep track of user input.
 */
exports.InputManager = class {
    constructor (engine) {
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
        this.mousePos = $V([0,0,0]);
        this.engine = engine;
        this.dragging = false;
        this.dragStartLocation = undefined;

        var self = this;
        document.onkeydown = function (e){self.keyHandler(e)};
        document.onkeyup = function (e){self.keyHandler(e)};

        this.mouseLeftDown = false;
        this.mouseRightDown = false;
        document.onmousedown = function(e){self.mouseDownHandler(e);};
        document.onmousemove = function(e){self.mouseMoveHandler(e);};
        document.onmouseup = function(e){self.mouseUpHandler(e);};
        //document.onclick = function (e){self.clickHandler(e)};

        this.userLeftClickHandler = undefined;
        this.userRightClickHandler = undefined;
        this.userDragHandler = undefined;

        document.addEventListener('mousemove', function(evt) {
            var rect = self.engine.canvas.getBoundingClientRect();
            self.mousePos = $V([evt.clientX - rect.left,evt.clientY - rect.top,0]);
        }, false);
    }

    registerRightClickHandler(handler) {
        this.userRightClickHandler = handler;
    }

    registerLeftClickHandler(handler) {
        this.userLeftClickHandler = handler;
    }

    registerDragHandler(handler){
        this.userDragHandler = handler;
    }

    mouseDownHandler (e) {
        switch (e.button){
            case 0:
                this.mouseLeftDown = true;
                break;
            case 2:
                this.mouseRightDown = true;
                break;
        }
        //console.log(this.mouseLeftDown,this.mouseRightDown);
    }

    mouseMoveHandler (e) {
        if (this.mouseLeftDown) {

            var screenLocation = $V([e.clientX, e.clientY,0]);
            var worldLocation = this.engine.camera.cameraToWorld(screenLocation);

            if (this.dragging == false) {
                this.dragging = true;
                this.dragStartLocation = worldLocation;
            }

            if (this.userDragHandler) {
                this.userDragHandler(this.dragStartLocation,worldLocation,false,e);
            }

        }

    }

    mouseUpHandler (e) {
        var screenLocation = $V([e.clientX, e.clientY,0]);
        var worldLocation = this.engine.camera.cameraToWorld(screenLocation);
        switch (e.button){
            case 0:
                this.mouseLeftDown = false;
                if (this.dragging) {
                    if (this.userDragHandler) {
                        this.userDragHandler(this.dragStartLocation, worldLocation, true, e);
                    }
                    this.dragging = false;

                } else {
                    if (this.userLeftClickHandler) {
                        if (this.userLeftClickHandler(worldLocation, e)){
                            this.triggerObjectOnClick(e);
                        }
                    } else {
                        this.triggerObjectOnClick(e);
                    }
                }
                break;
            case 2:
                this.mouseRightDown = false;
                if (this.userRightClickHandler) {
                    this.userRightClickHandler(worldLocation,e);
                }
                break;
        }
    }

    triggerObjectOnClick(e) {
        var screenLocation = $V([e.clientX, e.clientY,0]);
        var worldLocation = this.engine.camera.cameraToWorld(screenLocation);

        var selectedGameObject = this.engine.objectManager.get_object_at_location(worldLocation)
        if (selectedGameObject) {
            selectedGameObject.onClick(e);
        } else {

        }
    }


    keyHandler(e) {
        e = e || window.event;
        var state = e.type == "keydown";
        if (e.key == 'ArrowRight' || e.key == 'd') {
            this.right = state
        }
        else if (e.key == 'ArrowLeft' || e.key == 'a') {
            this.left = state
        }
        else if (e.key == 'ArrowUp' || e.key == 'w') {
            this.up = state
        }
        else if (e.key == 'ArrowDown' || e.key == 's') {
            this.down = state
        } else if (e.key == 'i' && e.type == "keydown") {
            //this.engine.debug = (this.engine.debug+1)%3;
        } else if (e.key == 'l' && e.type == "keydown") {
            //this.engine.lightingManager.debugMode = !this.engine.lightingManager.debugMode;
        }
    }
}
