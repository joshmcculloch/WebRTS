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

        var self = this;
        document.onkeydown = function (e){self.keyHandler(e)};
        document.onkeyup = function (e){self.keyHandler(e)};

        document.onclick = function (e){self.clickHandler(e)};

        document.addEventListener('mousemove', function(evt) {
            var rect = self.engine.canvas.getBoundingClientRect();
            self.mousePos = $V([evt.clientX - rect.left,evt.clientY - rect.top,0]);
        }, false);
    }

    clickHandler(e) {
        //console.log("Click:",e);
        var screenLocation = $V([e.clientX, e.clientY,0]);
        var worldLocation = this.engine.camera.cameraToWorld(screenLocation);
        console.log(worldLocation.e(1),worldLocation.e(2));

        var maxY = 0;
        var maxLayer = 0;
        var selectedGameObject = undefined;
        for (let gameObject of this.engine.objectManager.get_neighbours(worldLocation, 200)) {

            if (gameObject.getAABB().is_inside(worldLocation)) {
                if ((gameObject.location.e(2) > maxY && gameObject.location.e(3) == maxLayer )
                    || gameObject.location.e(3) > maxLayer) {
                    selectedGameObject = gameObject;
                    maxY = selectedGameObject.location.e(2);
                    maxLayer = selectedGameObject.location.e(3);
                }
            }
        }
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
            this.engine.debug = (this.engine.debug+1)%3;
        } else if (e.key == 'l' && e.type == "keydown") {
            this.engine.lightingManager.debugMode = !this.engine.lightingManager.debugMode;
        }
    }
}