var mysql  = require('mysql'),
	config = require('../config');

var connection = mysql.createConnection({
	host: config.db.host,
	user: config.db.user,
	password: config.db.password,
	database: config.db.database
});

connection.connect();
connection.query('SET time_zone = "' + config.db.timezone + '";');

module.exports = connection;