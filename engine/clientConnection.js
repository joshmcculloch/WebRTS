exports.ClientConnection = class {

    constructor () {
        this.socket = new WebSocket("ws://localhost:8080", ["webrts"]);
        this.ready = false;
        this.authenticated = false;
        var self = this;
        this.socket.onopen = function () {
            console.log("connection opened");

            self.ready = true;

            self.authenticate("yeknom", "password");
        };

        this.socket.onmessage = function (message) {
            console.log("Got:", message);
            //self.socket.send("hi");
        }
    }

    authenticate (username, password) {
        this.socket.send(JSON.stringify({target: "authenticate", username: username, password: password}));
    }
};