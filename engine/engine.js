class Engine {
    constructor (canvas_id) {
        this.objectManager = new ObjectManager();
        this.assetManager = new AssetManager(this);
        this.inputManager = new InputManager();
        this.canvas = document.getElementById(canvas_id);
        this.context = this.canvas.getContext('2d');
        this.last_update = new Date().getTime()/1000;

    }

    start() {
        this.update();
    }

    render() {
        this.objectManager.gameObjects.sort(function(a,b) {return a.location.e(2) - b.location.e(2);});
        engine.context.save();
        this.context.fillStyle = "#6495ED";
        this.context.fillRect(0,0,this.canvas.width, this.canvas.height);

        for(let gameObject of this.objectManager.gameObjects) {
            engine.context.save();
            gameObject.draw();
            engine.context.restore();
        }
        engine.context.restore();
    }

    updateCanvasSize(width,height) {
        this.canvas.width  = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    update() {
        console.log(this.inputManager.up);
        var current_time = new Date().getTime()/1000;
        var delta_time = current_time - this.last_update;
        this.updateCanvasSize();
        for(let gameObject of this.objectManager.gameObjects) {
            gameObject.update(delta_time);
        }
        this.render();
        setTimeout(this.update.bind(this),20);
        this.last_update = current_time;
    }

}


