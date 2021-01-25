var http = require('http');
var WebSocketServer = require('websocket').server;
var crypto = require('crypto');
var fs = require('fs');
var Messages = require('./messages.js');

exports.UserManager = class {

    constructor (engine) {
        this.engine = engine;
        this.lastUserID = 1;
        this.creds = {};
        this.loadCreds();
    }

    saveCreds () {
        var json = JSON.stringify({
            lastUserID: this.lastUserID,
            creds: this.creds
        });
        fs.writeFileSync('creds.json', json, 'utf8');
    }

    loadCreds () {
        if (fs.existsSync('creds.json')) {
            try {
                var json = fs.readFileSync('creds.json', 'utf8');
                var obj = JSON.parse(json);
                this.lastUserID = obj.lastUserID;
                this.creds = obj.creds;
            } catch (err) {
                console.log("Failed to load creds");
                this.lastUserID = 1;
                this.creds = {};
            }
        } else {
        }
    }

    userID (username) {
        if (this.creds[username]) {
            return this.creds[username].id;
        } else {
            return -1;
        }
    }

    createUser (username, password) {
        password = crypto.createHash('sha256').update(password, 'utf8').digest().toString('hex');
        if (!this.creds[username]) {
            this.creds[username] = {id: this.lastUserID+1, password: password};
            this.lastUserID = this.creds[username].id;
            this.saveCreds();
            return true;
        } else {
            return false;
        }
    }

    authenticate (username, password) {
        password = crypto.createHash('sha256').update(password, 'utf8').digest().toString('hex');
        if (this.creds[username] && this.creds[username].password == password) {
            return true;
        } else {
            return false;
        }
    }
};

function originIsAllowed(origin) {
    return true;
}

exports.ClientManager = class  {
    constructor (engine, userManager) {
        this.clients = {};
        this.userManager = userManager;
        this.userManager.saveCreds();
        this.engine = engine;
        this.onSignup = function (engine, userID){};
        this.server = http.createServer(function (request, response) {
            console.log((new Date()) + ' Received request for ' + request.url);
            response.writeHead(404);
            response.end();
        });
        var self = this;
        this.server.listen(8192, function () {
            console.log((new Date()) + ' Server is listening on port 8192');
        });

        this.wsServer = new WebSocketServer({
            httpServer: this.server,
            autoAcceptConnections: false
        });

        this.wsServer.on('request', function(request) {
            if (!originIsAllowed(request.origin)) {
                request.reject();
                console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
                return;
            }

            var connection = request.accept('webrts', request.origin);
            console.log((new Date()) + ' Connection accepted.');
            new Client(connection, self, self.userManager);

        });
    }

    broadcast (object) {
        var count = 0;
        for(var c in this.clients) {
            this.clients[c].send(object);
            count += 1;
        }
        //console.log("Broadcast:", count);
    }

};

class Client {
    constructor (connection, clientManager, userManager) {
        this.connection = connection;
        this.clientManager = clientManager;
        this.userManager = userManager;
        this.engine = this.clientManager.engine;
        this.userID = 0;
        this.authenticated = false;
        var self = this;
        connection.on('message', function (message) {self.onMessage(message)});
        connection.on('close',function (reasonCode, description) {self.onMessage(reasonCode, description)});

    }

    authenticate (message) {
        if (this.userManager.authenticate(message.username, message.password)) {
            this.authenticated = true;
            this.userID = this.userManager.userID(message.username);

            this.clientManager.clients[this.userID] = this;
            console.log(message.username," logged in", this.userID);
            this.send({target: "network_manager",
                type: "userParams",
                id: this.userID,
                username: message.username,
                authenticated: this.authenticated});
        } else {
            console.log("Unable to authenticate");
        }
        if(typeof message.callbackID !== 'undefined') {
            this.send({target: "network_manager", callbackID: message.callbackID, authenticated: this.authenticated});
        }

    }

    signup (message) {
        var success = false
        if (message.username && message.password) {
            if (this.userManager.createUser(message.username, message.password)) {
                this.clientManager.onSignup(this.engine, this.userManager.userID(message.username));
                success = true;
            } else {


            }
        }
        if(typeof message.callbackID !== 'undefined') {
            this.send({target: "network_manager", callbackID: message.callbackID, success: success});
        }
    }

    subscribe () {
        for (let go of this.engine.objectManager.gameObjects) {
             this.send(Messages.instantiate(go));
        }
    }

    onMessage (message) {
        //console.log(message);
        if (message.type === 'utf8') {
            //console.log('Received Message: ' + message.utf8Data);
            //this.connection.sendUTF(message.utf8Data);
            var messageData = JSON.parse(message.utf8Data);
            if (messageData.type == "authentication") {
                this.authenticate(messageData);
            } else if (messageData.type == "signup") {
                this.signup(messageData);
            } else if (messageData.type == "subscribe") {
                this.subscribe();
            } else if (messageData.type == "call_remote") {
                console.log(messageData);
                if (messageData.engine_id !== undefined
                    && messageData.method !== undefined
                    && messageData.parameters !== undefined) {
                    //Check the object exists and the user owns it
                    if (this.engine.objectManager.id_to_objects[messageData.engine_id]) {
                        if (this.engine.objectManager.id_to_objects[messageData.engine_id].clientOwned(this.userID)) {
                            //console.log("attempting remote call", messageData.method, messageData.parameters);
                            this.engine.objectManager.call_remote(messageData.engine_id, messageData.method, messageData.parameters);
                        } else {
                            console.log(this.engine.objectManager.id_to_objects[messageData.engine_id].members.ownerID, this.userID);
                            console.log("User attempted remote call on non-owned object!");
                        }
                    } else {
                        console.log("User attempted remote call on object that doesn't exist!");
                    }
                }

            }
        }
    }

    onClose(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    }

    send(object) {
        this.connection.send(JSON.stringify(object));
    }
}

exports.Client = Client;
