var socket = io();

var nameTmp = "";
var roomTmp = "";

// bind 'enter' key with 'send'
$(function(){
	toggleModal("#LogIn", true);
    $('#chatText').keydown(function(e){
    	if (e.which == 13) {
			messageSend($(this).val());
			// check(); /* For debug only */
			e.preventDefault();
		}
    });
	
});

/* Create a user if not exist (to the database) */
var createUser = function(name) {
	$('#output').text('createUser ' + name);
	socket.emit('createUser', name);
}
socket.on('createUserRes', function (err) {
	$('#output').text('createUserRes: ' + err);
	if (err == 0) {
		toggleModal("#SignIn", false);
		toggleModal("#LogIn", true);
	} else {
		alert(err);
	}
});	

/* Add user to the activatedUsers list if it is not there */
var loginUser = function(name) {
	$('#output').text('loginUser ' + name);
	socket.emit('loginUser', name);
	nameTmp = name;
}
socket.on('loginUserRes', function(err) {
	// $('#output').text('loginUserRes: ' + err);
	if (err == 0) {
		toggleModal("#LogIn", false);
		toggleModal("#JoinRoom", true);
		listRooms();
		} else {
		alert(err);
	}
});

/* List existing active rooms */
var listRooms = function() {
	$('#output').text('listRooms ');
	socket.emit('listRooms');
}
socket.on('listRoomsRes', function(activeRooms) {
	// var out = "";
	// for (var i in activeRooms) {
	// 	out += i + ": " + activeRooms[i] + ", ";
	// }
	// $('#output').text('listRoomsRes: ' + out);
	$('#roomList').empty();
	for (var i in activeRooms) {
		console.log(activeRooms[i]);
		var roomItem = 
		"<li>" + 
		"<div class='roomItem'>" +
		activeRooms[i] +
		"</div></li>"
		;
		$('#roomList').append(roomItem);
	}
	
	$('#roomList li').each(function(i,v) {
		$(v).on('mouseover', function() {
			$(v).css('background-color', "aqua");
		}).on('mouseout', function() {
			$(v).css('background-color', "");
		}).on('click', function() {
			$('#roomSelect').val($(v).find('.roomItem').html());
		});
	});
	
});

var joinRoom = function(room) {
	$('#output').text('joinRoom ' + room);
	roomTmp = room;
	socket.emit('joinRoom', room);
}
socket.on('joinRoomRes', function(err) {
	clean();
	$('#output').text('joinRoomRes: ' + err);
	toggleModal("#JoinRoom", false);
	NameDisplay(nameTmp);
	RoomDisplay(roomTmp);
});

var leaveRoom = function() {
	$('#output').text('leaveRoom ');
	socket.emit('leaveRoom');
	RoomDisplay('');
	toggleModal('#JoinRoom', true);
}
socket.on('leaveRoomRes', function(err) {
	$('#output').text('leaveRoomRes ' + err);
	if (err == 0)
		listRooms();
});

var messageSend = function (msg) {
	$('#output').text('messageSend ' + msg);
	socket.emit('messageSend', msg);
	$('#chatText').val('');
}
socket.on('messageSendRes', function(err) {
	$('#output').text('messageSendRes ' + err);
});

socket.on('roomMessage', function(msg) {
	$('#output').text('roomMessage ' + msg);
	/* Render messages on the message panel */	
	var msgItem =
		"<li>" +
		"<div class='nameDate'>" + msg.user + 
		" spoke on " + msg.date + ":</div>" +
		"<div class='content'>" + msg.content + "</div>" +
		"</li>"
	$("#messageArea").append(msgItem);
	
	if ($("#messageArea").children().length > 10) {
		$("#messageArea li:lt(2)").remove();
	}
	
	// $("#messageArea").scrollTop($("#messageArea").height());
});

socket.on('historyMessages', function(msgs) {
	// $('#output').text('roomMessage ' + msgs);
	/* Render messages on the message panel */
	for (var i = msgs.length - 1; i >= 0; i --) {

		var msg = msgs[i];
		$('#output').text('roomMessage ' + msg);

		var date = "";
		if (msg.createTime) {
			date = new Date(parseInt(msg.createTime));
		} else {
			date = new Date();
		}
		
		var msgItem =
			"<li>" +
			"<div class='history'>" + msg.user + 
			" spoke on " + date + ":</div>" +
			"<div class='history'>" + msg.content + "</div>" +
			"</li>"
		$("#messageArea").append(msgItem);
	}
	// $("#messageArea").scrollTop($("#messageArea").height());
});

var clean = function () {
	$('#messageArea').empty();
	return false;
}

var NameDisplay = function(name) {
	$('#userName').val(name);
	$('#output').text('userName ' + $('#userName').val());	
}
var RoomDisplay = function(name) {
	$('#roomName').val(name);
}

/*
	Debug function
*/
var check = function() {
	var cmdline = $('#input').val().split(" ");
	var command = cmdline[0];
	var content = cmdline[1];
	switch(command) {
	case "createUser":
		createUser(content);
		break;
	case "loginUser":
		loginUser(content);
		break;
	case "createRoom":
		createRoom(content);
		break;
	case "listRooms":
		listRooms();
		break;
	case "joinRoom":
		joinRoom(content);
		break;
	case "leaveRoom":
		leaveRoom();
		break;
	case "messageSend":
		messageSend(content);
		break;
	default:
		$('#output').text('Undefined cmd');
		break;
	}
}
