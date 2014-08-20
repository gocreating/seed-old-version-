var User = require('../../models/user');
var pswd = require('../../models/passwordHandle');
var status = require('../../status');
var jwt = require('jwt-simple');
var moment = require('moment');
var config = require('../../config');

module.exports = function (router) {
	router.route('/api/user')
		.get(function (req, res) {
			User.readAll(function (err, readUsers) {
				res.reply(err, 'cannot read users', 'read user successfully', null, null, readUsers);
			});
		})
		.post(function (req, res) {
			User.checkExist(req.body.email, function (err, isExist) {
				if (isExist) {
					res.reply(err || true, 'email already exist', '', null, null, null, status.USER_EMAIL_EXIST);
				} else {
					User.create({
						email: req.body.email,
						password_hash: pswd.hash(req.body.password),
						name: req.body.name,
						sex: req.body.sex,
						birthday: req.body.birthday,
						phone: req.body.phone,
						address: req.body.address,
						register_at: new Date(),
						update_at: new Date()
					}, function (err, readUserId) {
						res.reply(err, 'cannot create the new user', 'create successfully', null, null, readUserId);
					});
				}
			});
		});

	router.route('/api/user/login')
		.post(function (req, res) {
			User.login({
				email: req.body.email,
				password_hash: pswd.hash(req.body.password)
			}, function (err, readUser) {
				if (!readUser) {
					res.reply(err || true, 'wrong email or password', '', null, null, null, status.USER_WRONG_ACCOUNT);
				} else {
					var expiration = moment().add('days', 7).valueOf();
					var user = {
						user_id: readUser.user_id,
						email: readUser.email,
						name: readUser.name
					};
					var token = jwt.encode({
						user: user,
						expiration: expiration
					}, config.secret.tokenSecret);

					res.reply(err, 'cannot login the user', 'login successfully', null, null, {
						token: token,
						user: user
					});
				}
			});
		});

	router.route('/api/user/logout')
		.get(function (req, res) {
			res.reply(null, '', 'logout successfully');
		});

	router.route('/api/user/:user_id')
		.get(function (req, res) {
			User.read(req.params.user_id, function (err, readUser) {
				res.reply(err, 'cannot read the user', 'read user successfully', null, null, {
					user_id: readUser.user_id,
					email: readUser.email,
					name: readUser.name,
					sex: readUser.sex
				});
			});
		})
		.put(function (req, res) {
			console.log('put');
		})
		.delete(function (req, res) {
			console.log('delete');
		});
};