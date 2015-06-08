
/*
	Dependency: jquery, socket.io
*/

var socket = io();

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
	socket.emit('chat message', 
		{
			'user': user,
			'text': text
		}
	);
	$('#chatText').val('');
	return false;
}

socket.on('broadcast message', function(msg) {
	var nameTag = $('<li class="nameTag" style="display:none">').text(msg.user + "");
	var msgTag = $('<li class="messageTag" style="display:none">').text(msg.text);
	$('#messageArea').append(nameTag);
	$('#messageArea').append(msgTag);
	nameTag.fadeIn(200);
	msgTag.fadeIn(200);
});

socket.on('enter room', writeHistoryMessages);

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
		$('#messageArea li').eq(0).after($('<li class="timeTag">').text(value.createTime + ""));		
		$('#messageArea li').eq(0).after($('<li class="nameTag">').text(value.user + ""));	
	});	
}

$(function(){
    $('#chatText').keydown(function(e){
    	if (e.which == 13) {
			send();
			e.preventDefault();
		}
    });
    }
);