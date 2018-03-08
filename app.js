"use strict"
//You can't use classes in "normal mode"... -.-

const app = require("express")();
const http = require("http").Server(app);

process.on("SIGINT", function() {
	console.log("Shutting BSOServer down...");
	process.exit();
});

var mode;

var Debug = function(msg) {
	if (mode == "debug") {
		console.log("[DEBUG] " + msg.toString());
	}
}

class _BSOPlayer {
	constructor(data) {
		this.coordinates = data;
	}
	
	setPosition(x, y, z) {
		this.coordinates.x = x;
		this.coordinates.y = y;
		this.coordinates.z = z;
	}
	
	getPosition() {
		return this.coordinates;
	}
}

class _BSOServer {
	constructor(port, modex) {
		this.port = port;
		this.running = false;
		if (!(modex == "production") || modex == null) {
			//Switch developer mode
			mode = "debug";
		} else {
			mode = "production";
		}
	}
	
	start() {
		this._BSOInit();
		http.listen(this.port)
	}
	
	_BSOInit() {
		this.io = require("socket.io")(http);
		console.log("Server is running at port "+this.port);
		Debug("Running in Mode " + mode);
		this.running = true;

		var slots = {};
		var clients = new Array();

		app.get("/", function (req, res) {
			res.sendFile(__dirname+"\\index.html");
		});

		app.get("/dist/:files", function(req, res) {
			res.sendFile(__dirname+"\\dist\\"+req.params.files);
		});
		
		this.io.on("connection", function(socket) {
			var id = socket.conn.id;
			
			//Then, after we requested the identity, we can set up the answer event:
			console.log("Client connected, id: " + socket.conn.id);
			
			socket.on("player_create", function(jsonData) {
				var data = JSON.parse(jsonData);
				var p = new _BSOPlayer(data);
				if (slots[id] == null) {
					slots[id] = p;
					clients.push(id);
					socket.broadcast.emit("broadcast", JSON.stringify({clients, slots}));
					socket.emit("broadcast", JSON.stringify({clients, slots}));
					console.log("created new player");
					Debug(slots);
				}
			});
			
			socket.on("update", function (jsonData) {
				var updateData = JSON.parse(jsonData);
				if (!(slots[id] == null)) {
					slots[socket.conn.id].coordinates = updateData;

					//broadcast to all clients except sender...
					socket.broadcast.emit("broadcast", JSON.stringify({clients, slots}));
					//...and to the sender.
<<<<<<< HEAD
					socket.emit("broadcast", JSON.stringify({clients, slots}));
					Debug(slots);
=======
					socket.emit("broadcast", {clients, slots});
>>>>>>> d6fe007286f413c30e4b4c6b0aa8bb42f74115eb
				}
			});

			//Manual Update
			socket.on("pullSlots", function() {
				if (!(slots[id] == null)) {
					console.log("Sent player slots to " + id);
					socket.emit("pushSlots", JSON.stringify({clients, slots}));
				}
			});

			socket.on("disconnect", function() {
				delete slots[id];
				delete clients[clients.indexOf(id)];
				socket.broadcast.emit("broadcast", JSON.stringify({clients, slots}));
				console.log(id + " disconnected");
			});

			socket.on("fire", function() {
				//handle fire events
				Debug(id + " fired!");
			});
		});
	}
}

var Server = new _BSOServer((process.argv[2] || 666), process.argv[3]);
Server.start();