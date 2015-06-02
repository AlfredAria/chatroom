/* Summerize sqlite3 db operations. These includes insert and select from any table. */

var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('chatdb.db');

module.exports = {
	userCreate: function(name, createTime, lastLogin) {
		db.run("insert into user (name, createTime, lastLogin) values (?,?,?)",
			name, createTime, lastLogin);
	},
	
	/* callback(err, count) */
	userCheck: function(name, callback) {
		db.get("select count(*) as count from user where name = ?", name, function(err, row) {			
			callback(err, row.count);
		});
	},
	
	roomCreate: function(name, createTime) {
		db.run("insert into room (name, createTime) values (?,?)",
			name, createTime);
	},
	
	/* callback(err, room) Get room with name */
	roomCheck: function(name, callback) {
		db.get("select * from room where name = ?", name, function(err, row) {
			callback(err, row);
		});
	},
	
	/* Use user.id and room.id instead of user.name and room.name */
	messageCreate: function(user, room, createTime, content) {
		db.run("insert into message (user, room, createTime, content) values (?,?,?,?)",
			user, room, createTime, content);
	},
	
	/* callback(err, messages) Return 10 newest messages in this room */
	messageCheck: function(room, callback) {
		db.all("select * from message where room = ? order by createTime limit 10",
			room, function(err, rows) {
				callback(err, rows);
			});
	}
}