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

        document.addEventListener('mousemove', function(evt) {
            var rect = self.engine.canvas.getBoundingClientRect();
            self.mousePos = $V([evt.clientX - rect.left,evt.clientY - rect.top,0]);
        }, false);
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
            this.engine.debug = (this.engine.debug+1)%4;
        }
    }
}