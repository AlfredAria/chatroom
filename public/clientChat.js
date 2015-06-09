
var socket = io();

// bind 'enter' key with 'send'
$(function(){
    $('#chatText').keydown(function(e){
    	if (e.which == 13) {
			send();
			e.preventDefault();
		}
    });
});

/*
	Client actions
*/

// userSpoke
function send(){
	var text = $('#chatText').val();
	var user = $('#userName').val();
	
	// Verify user name
	if (user.length == 0) {
		alert("Tell me your name first!");
		return false;
	} else {
		$('#userName').attr('readonly','readonly');
	}
	
	// Verify message
	if (text.length == 0) return false;
	socket.emit('userSpoke', 
		{
			'user': user,
			'text': text
		}
	);
	$('#chatText').val('');
	return false;
}

// nameCheck todo
function nameCheck(name) {
	// emit nameCheck event
}

// roomCreate todo
function roomCreate(name) {
	// emit roomCreate event
}

// shareLink todo
function shareLink() {
	// Create the access url link for the current page, so the user can send it to other people
}

/*
	Server events
*/

socket.on('roomMessage', function(msg) {

	//todo
	if (msg.user === '' /* Me ? */) {}
	else if (msg.user === '' /* Server ? */) {}
	else /* Others */ {}
	
	
	var nameTag = $('<li class="nameTag" style="display:none">').text(msg.user + "");
	var msgTag = $('<li class="messageTag" style="display:none">').text(msg.text);
	$('#messageArea').append(nameTag);
	$('#messageArea').append(msgTag);
	nameTag.fadeIn(200);
	msgTag.fadeIn(200);
});

socket.on('broadcastMessage', function(msg) {
	// only use it now for debug. todo 
	console.log("Broadcast message received: ");
	console.log(msg);
}); 

//?? todo
socket.on('serverDown', function() {
	// only use it now for debug. 
	console.log("serverDown");
	console.log(msg);
}); 

//?? todo
socket.on('serverUp', function() {
	// only use it now for debug. 
	console.log("serverUp");
	console.log(msg);
}); 


socket.on('userJoin', writeHistoryMessages);

// Put obtained messages to the page
// Param: a pack of messages ordered from latest to earliest
function writeHistoryMessages(msgPack) {
	$(msgPack).each(function(index,value) {
		/*
		$('#messageArea').append($('<li class="nameTag">').text(value.user + ""));
		$('#messageArea').append($('<li class="timeTag">').text(value.createTime + ""));		
		$('#messageArea').append($('<li class="messageTag">').text(value.content + ""));		
		*/
		$('#messageArea li').eq(0).after($('<li class="messageTag">').text(value.content + ""));		
		$('#messageArea li').eq(0).after($('<li class="timeTag">').text(
			new Date(parseInt(value.createTime))
		));		
		$('#messageArea li').eq(0).after($('<li class="nameTag">').text(value.user + ""));	
	});	
}

function clean() {
	$('#messageArea').empty();
	return false;
}

