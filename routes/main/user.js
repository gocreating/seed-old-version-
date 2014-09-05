var User = require('../../models/user');
var pswd = require('../../models/passwordHandle');
var status = require('../../status');
var jwt = require('jwt-simple');
var moment = require('moment');
var config = require('../../config');
var nodemailer = require('nodemailer');

var sendVerificationMail = function (res, err, readUser, cb) {
	// Send with SES
	var ses = require('nodemailer-ses-transport');
	var transporter = nodemailer.createTransport(ses({
		accessKeyId: config.email.ses.accessKeyId,
		secretAccessKey: config.email.ses.secretAccessKey
	}));

	// Send with Default SMTP
	// var transporter = nodemailer.createTransport();

	var token = jwt.encode({
		user_id: readUser.user_id,
		expiration: moment().add(config.expiration.verificationMail[0], config.expiration.verificationMail[1]).valueOf()
	}, config.secret.tokenSecret);

	var verificationUrl = 'http://' + config.app.host + ':' + config.app.port.http + '/user/verification?verifyToken=' + token;

	transporter.sendMail({
		from: 'no-reply@entrepreneurclub.tw',
		to: readUser.email,
		subject: 'Email Verification',
		text: 'Email Verification',
		html: 'Hi ' + readUser.name + ',<br><br>' +
			  'Welcome to [Product Name]<br><br>' +
			  'The only thing left to do before getting started is to verify this email, which you can do by clicking below:<br><br>' +
			  '<a href="' + verificationUrl + '">Verify my account</a><br><br>' +
			  'Alternatively, click the following link:<br><br>' +
			  '<a href="' + verificationUrl + '">' + verificationUrl + '</a><br><br>' +
			  'If you didn\'t sign up for [Product Name], please ignore this email.'
	}, cb);
};

function makePassword (length, sourceString) {
	var index = (Math.random() * (sourceString.length - 1)).toFixed(0);
	return length > 0 ? sourceString[index] + makePassword(length - 1, sourceString) : '';
};

var sendRecoveryMail = function (res, err, readUser, cb) {
	// Send with SES
	var ses = require('nodemailer-ses-transport');
	var transporter = nodemailer.createTransport(ses({
		accessKeyId: config.email.ses.accessKeyId,
		secretAccessKey: config.email.ses.secretAccessKey
	}));

	var newPassword = makePassword(15, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
	var token = jwt.encode({
		user_id: readUser.user_id,
		newPassword: newPassword,
		expiration: moment().add(config.expiration.recoveryMail[0], config.expiration.recoveryMail[1]).valueOf()
	}, config.secret.tokenSecret);

	var resetUrl = 'http://' + config.app.host + ':' + config.app.port.http + '/user/password/reset?resetToken=' + token;

	transporter.sendMail({
		from: 'no-reply@entrepreneurclub.tw',
		to: readUser.email,
		subject: 'Password Recovery Instruction',
		text: 'Password Recovery Instruction',
		html: 'Hi ' + readUser.name + ',<br><br>' +
			  'Someone has requested a link to change your password. You can do this through the link below.<br><br>' +
			  '<a href="' + resetUrl + '">Change my password</a><br><br>' +
			  'Then, your new password will be: <b>' + newPassword + '</b> <br><br>' +
			  'If you didn\'t request this, please ignore this email.<br><br>' +
			  'Your password won\'t change until you access the link above.'
	}, cb);
};

module.exports = function (router) {
	router.route('/api/user')
		.get(function (req, res) {
			User.readAll(function (err, readUsers) {
				res.reply(err, 'cannot read users', 'read user successfully', null, null, readUsers);
			});
		})
		.post(function (req, res) {
			User.checkExist(req.body.email, function (err, existUser) {
				if (existUser) {
					res.reply(err || true, 'email already exist', '', null, null, null, status.USER_EMAIL_EXIST);
				} else {
					User.create({
						user_type: User.USER_TYPE.LOCAL,
						open_id: 0,
						email: req.body.email,
						is_verified: false,
						password_hash: pswd.hash(req.body.password),
						name: req.body.name,
						sex: req.body.sex,
						birthday: req.body.birthday,
						extra: JSON.stringify({
							phone: req.body.phone,
							address: req.body.address
						}),
						create_at: new Date(),
						update_at: new Date()
					}, function (err, readUser) {
						sendVerificationMail(res, err, readUser, function (err, response) {
							if (err) {
								User.deleteById(readUser.user_id, function (err) {
									res.reply(true, '', '', null, null, null, status.ERR_EMAIL_SEND);
								});
							} else {
								console.log('email sended');
								res.reply(false, '', 'We have sent you an email, please verify it in 3 hours', null, null, {
									user_id: readUser.user_id,
									email: readUser.email,
									name: readUser.name
								});
							}
						});
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
					var user = {
						user_id: readUser.user_id,
						is_verified: readUser.is_verified,
						email: readUser.email,
						name: readUser.name
					};
					var token = jwt.encode({
						user: user,
						expiration: moment().add(config.expiration.loginToken[0], config.expiration.loginToken[1]).valueOf()
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

	// send verification mail
	router.route('/api/user/reverify')
		.post(function (req, res) {
			console.log('=== send verification mail ===');
			if (req.user.is_verified) {
				res.reply(true, 'You have been verified');
			} else {
				sendVerificationMail(res, null, req.user, function (err, response) {
					if (err) {
						res.reply(true, '', '', null, null, null, status.ERR_EMAIL_SEND);
					} else {
						res.reply(false, '', 'We have sent you an email, please verify it in 3 hours');
					}
				});
			}
		});

	// verify user
	router.route('/user/verification')
		.get(function (req, res) {
			try {
				var decoded = jwt.decode(req.query.verifyToken, config.secret.tokenSecret);
				if (decoded.expiration <= Date.now()) {
					res.replyByRedirect(
						'/user/login',
						'Token has expired. Please login and resend verification mail',
						null,
						null,
						status.TOKEN_EXPIRATION
					);
				} else {
					User.readById(decoded.user_id, function (err, readUser) {
						if (err) throw err;
						if (readUser.is_verified) {
							res.replyByRedirect(
								'/',
								'You have been verified',
								null,
								null,
								status.ERR_RE_VERIFICATION
							);
						} else {
							User.updateById(readUser.user_id, {
								is_verified: true
							}, function (err) {
								if (err) throw err;
								res.replyByRedirect(
									'/user/login',
									'Thanks for your registration, you can login now',
									null,
									null,
									status.SUCC_VERIFICATION
								);
							});
						}
					});
				}
			} catch (err) {
				res.send('Token format error');
			}
		});

	// send password recovery instruction
	router.route('/api/user/password/recovery')
		.post(function (req, res) {
			console.log('=== send recovery mail ===');
			User.read({
				email: req.body.email
			}, function (err, readUser) {
				if (!readUser) {
					res.reply(true, '', '', null, null, null, status.USER_EMAIL_NOT_EXIST);
				} else {
					sendRecoveryMail(res, err, readUser, function (err, response) {
						if (err) {
							res.reply(true, '', '', null, null, null, status.ERR_EMAIL_SEND);
						} else {
							res.reply(false, '', 'We have sent you an email with instructions, please check it in 1 hour');
						}
					});
				}
			});
		});

	// reset password
	router.route('/user/password/reset')
		.get(function (req, res) {
			try {
				var decoded = jwt.decode(req.query.resetToken, config.secret.tokenSecret);
				if (decoded.expiration <= Date.now()) {
					res.replyByRedirect(
						'/',
						'Token has expired, fail to reset password',
						null,
						null,
						status.RECOVERY_TOKEN_EXPIRATION
					);
				} else {
					User.updateById(decoded.user_id, {
						password_hash: pswd.hash(decoded.newPassword)
					}, function (err) {
						if (err) throw err;
						res.replyByRedirect(
							'/user/login',
							'Your password has been reset. Please login with new password, and change password immediately',
							null,
							null,
							status.SUCC_RESET
						);
					});			
				}
			} catch (err) {
				res.send('Token format error');
			}
		});

	router.route('/api/user/:user_id')
		.get(function (req, res) {
			User.readById(req.params.user_id, function (err, readUser) {
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