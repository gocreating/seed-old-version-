var User = require('../../models/user');
var pswd = require('../../models/passwordHandle');

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
					res.reply(null, err || 2, 'email already exist');
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