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

    Login () {
        new Login(this.guiLayer);
    }
};

class Container {

    constructor (parent) {
        this.element = document.createElement("div");
        this.element.className = "gui_container";
        this.element.style.margin = "0";
        parent.appendChild(this.element);
    }

    setLocation (location, fromTop=false) {
        this.element.style.left = location.e(1)+"px";
        if (fromTop) {
            this.element.style.top = location.e(2) + "px";
        } else {
            this.element.style.top = (location.e(2) - this.element.offsetHeight ) + "px";
        }
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


class Login extends Container {
    constructor (parent) {
        super(parent);
        var self = this;
        this.element.innerHTML =
            '<h3 class="gui">Login</h3>'+
            '<label for="username">Username: </label>'+
            '<input type="text" name="username" id="username" value=""><br>' +
            '<label for="password">Password: </label>'+
            '<input type="password" name="password" id="password" value=""><br>'+
            '<button>Login</button><button>Create Account</button>';
        this.element.getElementsByTagName("button")[0].onclick = this.login;
    }

    updateText (text) {
        this.element.innerHTML = text;
    }

    login () {
        console.log("got creds");
    }

    create_account () {

    }
}
exports.Login = Login;

