var db = require('./db');
var validator = require('validator');
var pswd = require('./passwordHandle');

var tableName = 'users';

exports.USER_TYPE = {
	UNKNOWN:  parseInt('00000001', 2), /*  1 */
	LOCAL:    parseInt('00000010', 2), /*  2 */
	FACEBOOK: parseInt('00000100', 2), /*  4 */
	TWITTER:  parseInt('00001000', 2), /*  8 */
	GOOGLE:   parseInt('00010000', 2)  /* 16 */
};

exports.SEX_TYPE = {
	UNKNOWN:  0,
	MALE:     1,
	FEMALE:   2,
	NO_NEED:  3
};

exports.read = function (condition, cb) {
	db.query('SELECT * FROM ' + tableName + ' WHERE ?', [condition], function (err, rows) {
		cb(err, rows[0]);
	});
};

exports.readById = function (id, cb) {
	db.query('SELECT * FROM ' + tableName + ' WHERE user_id = ?', [id], function (err, rows) {
		cb(err, rows[0]);
	});
};

exports.readByEmail = function (email, cb) {
	db.query('SELECT * FROM ' + tableName + ' WHERE email = ?', [email], function (err, rows) {
		cb(err, rows && rows[0]);
	});
};

exports.readAll = function (cb) {
	db.query('SELECT * FROM ' + tableName, function (err, rows) {
		cb(err, rows);
	});
};

exports.checkExist = function (email, cb) {
	db.query('SELECT * FROM ' + tableName + ' WHERE email = ?', [email], function (err, rows) {
		cb(err, rows && rows[0]);
	});
};

exports.create = function (item, cb) {
	db.query('INSERT INTO ' + tableName + ' SET ?', item, function (err) {
		if (err) cb(err, null);
		db.query('SELECT * FROM ' + tableName + ' WHERE email = ?', [item.email], function (err, rows) {
			cb(err, rows && rows[0]);
		});
	});
};

exports.login = function (item, cb) {
	db.query('SELECT * FROM ' + tableName + ' WHERE email = ? AND password_hash = ?', [item.email, item.password_hash], function (err, rows) {
		if (err) cb(err, null);
		cb(err, rows[0]);
	});
};

exports.socialLogin = function (item, cb) {
	exports.checkExist(item.email, function (err, existUser) {
		if (!existUser) {
			exports.create(item, function (err, readUser) {
				cb(err, readUser);
			});
		} else {
			cb(err, existUser);
		}
	});
};

exports.updateById = function (id, item, cb) {
	db.query('UPDATE ' + tableName + ' SET ? WHERE user_id = ?', [item, id], function (err) {
		cb(err);
	});
};

exports.deleteById = function (id, cb) {
	db.query('DELETE FROM ' + tableName + ' WHERE user_id = ?', [id], function (err) {
		cb(err);
	});
};