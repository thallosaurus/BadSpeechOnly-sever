"use strict"
const app = require("express")();
const http = require("http").Server(app);

process.on("SIGINT", function() {
	console.log("Shutdown BSOServer...");
	process.exit();
});

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
	constructor(port) {
		this.port = port;
		this.running = false;
	}
	
	start() {
		this._BSOInit();
		http.listen(this.port)
	}
	
	_BSOInit() {
		this.io = require("socket.io")(http);
		console.log("Server is running at localhost:"+this.port);
		this.running = true;

		//var slots = new Array();
		var slots = {};
		var clients = new Array();

		app.get("/", function (req, res) {
			res.sendFile(__dirname+"\\index.html");
		});

		app.get("/dist/:files", function(req, res) {
			res.sendFile(__dirname+"\\dist\\"+req.params.files);
		});
		
		//So, we connected to our server
		this.io.on("connection", function(socket) {
			var id = socket.conn.id;
			
			//Then, after we requested the identity, we can set up the answer event:
			console.log("Client connected, id: " + socket.conn.id);
			
			socket.on("player_create", function(data) {
				var p = new _BSOPlayer(data);
				if (slots[id] == null) {
					slots[id] = p;
					clients.push(id);
					socket.broadcast.emit("broadcast", {clients, slots});
					socket.emit("broadcast", {clients, slots});
					console.log("created new player");
				}
			});
			
			socket.on("update", function (updateData) {
				if (!(slots[id] == null)) {
					slots[socket.conn.id].coordinates = updateData;

					//broadcast to all clients except sender...
					socket.broadcast.emit("broadcast", {clients, slots});
					//...and to the sender.
					socket.emit("broadcast", {clients, slots});
				}
			});

			//Manual Update
			socket.on("pullSlots", function() {
				if (!(slots[id] == null)) {
					console.log("Sent player slots to " + id);
					socket.emit("pushSlots", {clients, slots});
				}
			});

			socket.on("disconnect", function() {
				delete slots[id];
				delete clients[clients.indexOf(id)];
				socket.broadcast.emit("broadcast", {clients, slots});
				console.log(id + " disconnected");
			});
		});
	}
}

var Server = new _BSOServer((process.argv[2] || 666));
//app.listen(pro);
Server.start();