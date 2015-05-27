/* Create tables if not exist, much like the "Generate scripts result using MS SQL Server" .
	Also use .schema to see the following queries using the sqlite3 shell
*/

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('chatdb.db');
db.serialize(function(){
	
	// Create user table
	db.run("Create table if not exists user (id integer primary key, name text, createTime text, lastLogin text)");

	// Create room table
	db.run("Create table if not exists room (id integer primary key, name text, createTime text)");
	
	// Create message table
	db.run("Create table if not exists message (id integer primary key, user integer, room integer, createTime text, content text)");
	
});
db.close();