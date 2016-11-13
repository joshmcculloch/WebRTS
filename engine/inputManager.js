/*
The InputManager is used to keep track of user input.
 */
exports.InputManager = class {
    constructor (engine) {
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
        this.engine = engine;
        var self = this;
        document.onkeydown = function (e){self.keyHandler(e)};
        document.onkeyup = function (e){self.keyHandler(e)};
    }


    keyHandler(e) {
        e = e || window.event;
        var state = e.type == "keydown";
        if (e.key == 'ArrowRight') {
            this.right = state
        }
        else if (e.key == 'ArrowLeft') {
            this.left = state
        }
        else if (e.key == 'ArrowUp') {
            this.up = state
        }
        else if (e.key == 'ArrowDown') {
            this.down = state
        } else if (e.key == 'd' && e.type == "keydown") {
            this.engine.debug = (this.engine.debug+1)%3;
        }
    }
}