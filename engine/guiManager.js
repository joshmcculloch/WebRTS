/**
 * Created by Josh on 13/11/2016.
 */
exports.GuiManager = class {

    constructor (engine, canvas) {
        this.engine = engine;
        this.guiLayer = document.createElement("div");
        canvas.parentElement.appendChild(this.guiLayer);
        this.guiLayer.className = "gui_layer";
        this.guiLayer.oncontextmenu = function(){return false;};
    }

    Window (_class) {
      return new Window(this.guiLayer,_class);
    }

    TextBox (text, location) {
        var tb = new TextBox(this.guiLayer, text);
        tb.setLocation(location);
        return tb;
    }

    Login (loginAction) {
        new Login(this.guiLayer, this.engine.networkManager,loginAction);
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
    constructor (parent, networkManager, loginAction) {
        super(parent);
        this.networkManager = networkManager;
        this.loginAction = loginAction;
        var self = this;
        this.element.innerHTML =
            '<h3 class="gui">Login</h3>'+
            '<label for="username">Username: </label>'+
            '<input type="text" name="username" id="username" value=""><br>' +
            '<label for="password">Password: </label>'+
            '<input type="password" name="password" id="password" value=""><br>'+
            '<button>Login</button><button>Create Account</button><br>'+
            '<span class="error_msg"></span>';
        this.element.getElementsByTagName("button")[0].onclick = function () {self.login();};
        this.element.getElementsByTagName("button")[1].onclick = function () {self.create_account();};
    }

    updateText (text) {
        this.element.innerHTML = text;
    }

    login () {
        var username = this.element.querySelector("#username").value;
        var password = this.element.querySelector("#password").value;
        var self = this;
        this.networkManager.authenticate(username, password,
            function (message) {
                if (message.authenticated) {
                    self.loginAction();
                    self.element.remove();
                } else {
                    self.element.getElementsByClassName("error_msg")[0].innerHTML = "Unable to login";
                }
            });
    }

    create_account () {
        console.log("create account");
        var username = this.element.querySelector("#username").value;
        var password = this.element.querySelector("#password").value;
        var self = this;
        this.networkManager.signup(username, password,
            function (message) {
                console.log(message);
                if (message.success) {
                    self.element.getElementsByClassName("error_msg")[0].innerHTML = "Account created, please login";
                } else {
                    self.element.getElementsByClassName("error_msg")[0].innerHTML = "Unable to create account";
                }
            });
    }
}
exports.Login = Login;


class Window extends Container {

  constructor (parent, _class) {
      super(parent);
      this.element.classList.add(_class);
  }

  add_button(text, onclick, _class) {
      var button =  document.createElement('input');
      button.value = text;
      button.type = "button";
      button.className = _class;
      button.onclick = onclick;
      this.element.appendChild(button);
  }

  add_slider(text, min, max, _class) {

  }

  add_text(text, _class) {

  }

}
