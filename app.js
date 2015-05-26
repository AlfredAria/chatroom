var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 3000;

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	console.log('A user has connected.');
	socket.on('chat message', function(msg){
		console.log('User ' + msg.user + ' said ' + msg.text);
		// ~ Append received date to the message
		// ~ Store message to SQLite database

		// Change broadcast to emitting to selected users
		io.emit('broadcast message', msg); // Sends to everybody
	});
	socket.on('disconnect', function() {
		console.log('User has leaved.');
	});
});

http.listen(port, function(){
	console.log('Server started and listening on ' + port);
});