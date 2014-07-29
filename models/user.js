var db = require('./db');
var validator = require('validator');
var pswd = require('./passwordHandle');

var tableName = 'users';

exports.read = function (id, cb) {
	db.query('SELECT * FROM ' + tableName + ' WHERE user_id = ?', [id], function (err, rows) {
		cb(err, rows[0]);
	});
};

exports.readAll = function (cb) {
	db.query('SELECT * FROM ' + tableName, function (err, rows) {
		cb(err, rows);
	});
};

exports.checkExist = function (email, cb) {
	db.query('SELECT * FROM ' + tableName + ' WHERE email = ?', [email], function (err, rows) {
		cb(err, rows.length > 0);
	});
};

exports.create = function (item, cb) {
	db.query('INSERT INTO users SET ?', item, function (err) {
		if (err) cb(err, null);
		db.query('SELECT LAST_INSERT_ID() AS id', function (err, rows) {
			cb(err, rows[0].id);
		});
	});
};