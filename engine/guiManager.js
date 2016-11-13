/**
 * Created by Josh on 13/11/2016.
 */
exports.GuiManager = class {

    constructor (canvas) {
        this.guiLayer = document.createElement("div");
        canvas.parentElement.appendChild(this.guiLayer);
        this.guiLayer.className = "gui_layer";
    }

    TextBox (text, location) {
        var tb = new TextBox(this.guiLayer, text);
        tb.setLocation(location);
        return tb;
    }
};

class Container {

    constructor (parent) {
        this.element = document.createElement("div");
        this.element.className = "gui_container";
        this.element.style.margin = "0";
        parent.appendChild(this.element);
    }

    setLocation (location) {
        this.element.style.left = location.e(1)+"px";
        this.element.style.top = (location.e(2)- this.element.offsetHeight )+"px";
    }

    delete () {
        this.element.remove();
    }
}
exports.Container = Container;

class TextBox extends Container {
    constructor (parent, text) {
        super(parent);
        this.element.innerHTML = text;
    }

    updateText (text) {
        this.element.innerHTML = text;
    }
}

exports.TextBox = TextBox;
