var express = require('express');
var app = express();
var url = require('url');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var db = require('./dbop.js');
var port = 3000;

var activeUsers = [];

// Make available the front-end javascript and css files
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.get('/:data', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
	
	// console.log('socket id: ' + socket.id);
	
	/*
		User create: Add user to the database,
		unless:
		- The user already exists in the database
	*/
	socket.on('createUser', function(user) {
		console.log('createUser ' + user);
	    // Check database for existing users
	   	// Create user if not exist
		db.userCheck(user, function(err, rowCount) {
			if (rowCount > 0) {
				var m = " User already created";
				console.log(m);
				socket.emit('createUserRes', m);
			}
			else {
				console.log(' 0');
				db.userCreate(user, new Date(), new Date());
				socket.emit('createUserRes', 0);
			}
		});
	});
	
	/*
		User login: Add user to the activeUsers list,
		unless:
		- The socket is already binded with an active user
		- The user is already logged in by someone else
		- The user does not exist in database
	*/
	socket.on('loginUser', function(user) {
		console.log('loginUser ' + user);
		if (socket["user"] !== undefined) {
			var m = " User has already logged in";
			console.log(m);
			socket.emit('loginUserRes', m);
		}
		else if (activeUsers.indexOf(user) != -1) {
			var m = " User has already logged in";
			console.log(m);
			// The user has logged in
			socket.emit('loginUserRes', m);
		} 
		else {
			// Check database
			db.userCheck(user, function(err, rowCount) {
				if (rowCount == 0) {
					var m = " User does not exist";
					console.log(m);
					socket.emit('loginUserRes', m);
				}
				else {
					// Put the user on the active Users list
					console.log(' 0');
					activeUsers.push(user);
					socket["user"] = user;
					socket.emit('loginUserRes', 0);
				}
			});
		}
	});
	
	socket.on('listRooms', function() {
		console.log('listRooms ' + socket["user"]);
		// Return all active rooms
		socket.emit('listRoomsRes', Object.keys(io.sockets.adapter.rooms));
	});
	
	/*
		Room join: adds a user to a room
		unless:
		- The user has not log in
		- The user has joined a room
	*/
	socket.on('joinRoom', function(room) {
		console.log('joinRoom ' + socket["user"] + ", " + room);
		if (socket["user"] === undefined) {
			var m = " User has not login";
			console.log(m);
			socket.emit('joinRoomRes', m);
		}
		else if (socket["room"] !== undefined) {
			var m = " User has already joined a room";
			console.log(m);
			socket.emit('joinRoomRes', m);
		}
		else {
			// If the user exists, add the user to the room
			socket.join(room);
			socket["room"] = room;
			var date = new Date();
			console.log("User joins room with name " + room);
			var msgObj = {
				'user': 'Server',
				'content': 'User ' + socket["user"] + ' has joined the conversation',
				'date': date
			}
			io.sockets.in(room).emit('roomMessage', msgObj);
			
			// Reply message
			socket.emit('joinRoomRes', 0);
			
			/*
				If the room is newly created, add it to the database
				If the room already exists, retrieve history messages			
			*/
			db.roomCheck(room, function(err, roomItem) {
				if (roomItem === undefined) {
					db.roomCreate(room, date);
				} else {
					db.messageCheck(roomItem.name, function(err, rows) {
						if (rows === undefined) return;
						console.log("There are " + rows.length + " rows found.");		
						socket.emit('historyMessages', rows);
					});					
				}
			});
		}
	});
	
	/*
		Room leave: removes a user from a room
		unless:
		- The user has not log in
	*/
	socket.on('leaveRoom', function() {
		console.log('leaveRoom ' + socket["user"] + socket["room"]);
		var room = socket["room"];
		if (socket["user"] === undefined) {
			var m = "User has not login";
			console.log(m);
			socket.emit('leaveRoomRes', m);
		}
		else if (room === undefined) {
			var m = " User has not joined any room";
			console.log(m);
			socket.emit('leaveRoomRes', m);
		}
		else {
			/*
				This is the last user to leave, then remove
				the room from the activate room list
			*/
			/*
			if (Object.keys(io.sockets.adapter.rooms[room]).length === 1) {
				var i = activeRooms.indexOf(room);
				if (i != -1)
					activeRooms.splice(i, 1);
			}
			*/
			var msgObj = {
				'user': 'Server',
				'content': 'User ' + socket["user"] + ' has left the conversation',
				'date': new Date()	
			}
			io.sockets.in(room).emit('roomMessage', msgObj);
			socket.leave(room);
			socket["room"] = undefined;
			socket.emit('leaveRoomRes', 0);
		}
	});
	
	/*
		Send user's message to people in the same room,
		unless:
		- User has not login 
		- User has not joined any room
	*/
	socket.on('messageSend', function(msg) {
		// console.log('messageSend ' + socket["user"] + " " + msg);
		if (socket["user"] === undefined) {
			var m = "User has not log in";
			console.log(m);
			socket.emit('messageSendRes', m);						
		}
		else if (socket["room"] === undefined) {
			var m = "User has not joined any room";
			console.log(m);
			socket.emit('messageSendRes', m);			
		} 
		else {
			/*
				Deliver to other users
			*/
			var date = new Date();
			var msgObj = {
				'user': socket["user"],
				'content': msg,
				'date': date
			};
			io.sockets.in(socket["room"]).emit('roomMessage', msgObj);
			socket.emit('messageSendRes', 0);
			/*
				Deliver to the database
			*/
			db.messageCreate(socket["user"], socket["room"], date, msg);
		}
	});
	
	/*
		Remove a user from the active user list if he leaves
	*/
	socket.on('disconnect', function() {
		console.log('disconnect: ' + socket.id);
		// Remove user from activeUsers list
		var i = activeUsers.indexOf(socket["user"]);
		if (i != -1)
			activeUsers.splice(i, 1);		
	});
});

http.listen(port, function(){
	console.log('Server started and listening on ' + port);
});