exports.NetworkManager = class {
    constructor (engine) {
        this.engine = engine;
        this.conn = new WebSocket("ws://localhost:8080","webrts");
        this.callbacks = {};
        this.lastCallbackID = 0;
        this.userID = 0;
        this.username = "";
        this.authenticated = false;

        var self = this;
        this.conn.onopen = function (evt) {
            console.log("Opened connection to server.");
            //self.authenticate("yeknom", "password");
        };

        this.conn.onclose = function (evt) {
            console.log("close");
            console.log(evt);
        };

        this.conn.onerror = function (evt) {
            console.log("error");
            console.log(evt);
        };

        this.conn.onmessage = function (evt) {
            //console.log("message");
            //console.log(evt.data);
            var message = JSON.parse(evt.data);
            if (message.target && message.target == "network_manager") {
                if (typeof message.callbackID !== 'undefined') {
                    if(self.callbacks[message.callbackID]) {
                        self.callbacks[message.callbackID](message);
                    }
                }
                if (message.type && message.type == "userParams") {
                    this.userID = message.id;
                    this.username = message.username;
                    this.authenticated = message.authenticated;
                }
            } else if (message.target && message.target == "object_manager") {
                if (message.type && message.type == "instansiate") {
                    //console.log("instansiate");
                    if (message.descriptor) {
                        self.engine.objectManager.create_from_descriptor(message.descriptor);
                    }
                } else if (message.type && message.type == "call_remote") {
                    if (message.engine_id && message.method && message.parameters) {
                        self.engine.objectManager.call_remote(message.engine_id, message.method, message.parameters);
                    }
                } else {

                }
            }
        };
    }

    subscribe () {
        this.send({type: "subscribe"});
    }

    authenticate(username, password, callback) {
        var callbackID = this.lastCallbackID++;
        this.callbacks[callbackID] = callback;
        this.send({type: "authentication", username: username, password: password, callbackID: callbackID});
    }

    signup(username, password, callback) {

    }

    send(object) {
        this.conn.send(JSON.stringify(object));
    }

};
