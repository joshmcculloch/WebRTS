exports.NetworkManager = class {
    constructor (engine, host, protocol) {
        this.engine = engine;
        this.conn = new WebSocket(host, protocol);
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

            var message = JSON.parse(evt.data);
            if (message.target && message.target == "network_manager") {
                if (typeof message.callbackID !== 'undefined') {
                    if(self.callbacks[message.callbackID]) {
                        self.callbacks[message.callbackID](message);
                    }
                }
                if (message.type && message.type == "userParams") {
                    console.log(evt.data);
                    self.userID = message.id;
                    self.username = message.username;
                    self.authenticated = message.authenticated;
                }
            } else if (message.target && message.target == "object_manager") {
                if (message.type && message.type == "instansiate") {

                    if (message.descriptor) {
                        self.engine.objectManager.create_from_descriptor(message.descriptor);
                    }
                } else if (message.type && message.type == "call_remote") {
                    if (message.engine_id >= 0 && message.method && message.parameters) {
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
        var callbackID = this.lastCallbackID++;
        this.callbacks[callbackID] = callback;
        this.send({type: "signup", username: username, password: password, callbackID: callbackID});
    }

    send(object) {
        this.conn.send(JSON.stringify(object));
    }

};
