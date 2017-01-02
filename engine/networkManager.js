exports.NetworkManager = class {
    constructor (engine) {
        this.engine = engine;
        this.conn = new WebSocket("ws://localhost:8080","webrts");

        var self = this;
        this.conn.onopen = function (evt) {
            console.log("open");
            console.log(evt.data);
            self.authenticate("yeknom", "password");
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
            //console.log(evt);
            var message = JSON.parse(evt.data);
            if (message.target && message.target == "object_manager") {
                if (message.type && message.type == "instansiate") {
                    if (message.descriptor) {
                        self.engine.objectManager.create_from_descriptor(message.descriptor);
                    }
                }
            }
        };
    }

    authenticate(username, password) {
        this.send({type: "authentication", username: username, password: password});
    }

    send(object) {
        this.conn.send(JSON.stringify(object));
    }
};
