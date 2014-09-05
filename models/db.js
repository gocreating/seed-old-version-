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

// var nativeQuery = connection.query;
// connection.query = function () {
// 	nativeQuery.apply(this, arguments);
// };

connection.on('error', function(err) {
	console.log(err); // 'ER_BAD_DB_ERROR'
});

module.exports = connection;