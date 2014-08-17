var User = require('../../models/user');
var pswd = require('../../models/passwordHandle');
var status = require('../../status');

module.exports = function (router) {
	router.route('/api/user')
		.get(function (req, res) {
			User.readAll(function (err, readUsers) {
				res.reply(readUsers, err, 'cannot read users');
			});
		})
		.post(function (req, res) {
			User.checkExist(req.body.email, function (err, isExist) {
				if (isExist) {
					res.reply(null, status.ERR_USER_EMAIL_EXIST, 'email already exist');
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
						res.reply(readUserId, err, 'cannot create the new user');
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
					res.reply(null, status.ERR_USER_LOGIN, 'wrong email or password');
				} else {
					req.session.isAuth = true;
					req.session.user = {
						user_id: readUser.user_id,
						email: readUser.email,
						name: readUser.name
					};
					res.reply(req.session.user, err, 'cannot login the user');
				}
			});
		});

	router.route('/api/user/logout')
		.get(function (req, res) {
			req.session.isAuth = false;
			delete req.session.user;
			res.reply(null, null, 'logout successfully');
		});

	router.route('/api/user/:user_id')
		.get(function (req, res) {
			User.read(req.params.user_id, function (err, readUser) {
				res.reply(readUser, err, 'cannot read the user');
			});
		})
		.put(function (req, res) {
			console.log('put');
		})
		.delete(function (req, res) {
			console.log('delete');
		});
};