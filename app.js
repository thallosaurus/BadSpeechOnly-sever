"use strict"
const app = require("express")();
const http = require("http").Server(app);

class _BSOPlayer {
	constructor(data) {
		//this.coordinates = new Array({"x":data.x,"y":data.y,"z":data.z});
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
		console.log("Constructed Server");
	}
	
	start() {
		this._BSOInit();
		http.listen(this.port)
		console.log();
		console.log("Server is running at localhost:"+this.port);
	}
	
	_BSOInit() {
		this.io = require("socket.io")(http);
		var slots = new Array();
		
		app.get("/", function (req, res) {
			res.sendFile(__dirname+"\\index.html");
		});
		
		//So, we connected to our server
		this.io.on("connection", function(socket) {
			//Then, after we requested the identity, we can set up the answer event:
			console.log("Client connected, id: " + socket.conn.id);
			
			socket.on("player_create", function(data) {
				var p = new _BSOPlayer(data);
				var id = socket.conn.id;
				if (slots[id] == null) {
					slots[id] = p;
					console.log("created new player");
				}
				console.log(slots);
			});
			
			socket.on("update", function (updateData) {
				var id = socket.conn.id;
				if (!(slots[id] == null)) {
					slots[socket.conn.id].coordinates = updateData;
					//.p.coordinates = updateData;
					console.log(slots);
				}
			});
				
			socket.on("disconnect", function() {
				delete slots[socket.conn.id];
				console.log(socket.conn.id + " disconnected");
			});
		});
	}
}

var Server = new _BSOServer(process.argv[2]);
//app.listen(pro);
Server.start();