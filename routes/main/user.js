var User = require('../../models/user');
var pswd = require('../../models/passwordHandle');
var status = require('../../status');
var jwt = require('jwt-simple');
var moment = require('moment');
var config = require('../../config');
// var Recaptcha = require('recaptcha').Recaptcha;
var nodemailer = require('nodemailer');

var sendMail = function (_to, _subject, _content, cb) {
	var transporter = nodemailer.createTransport();

	transporter.sendMail({
		from: 'no-reply@entrepreneurclub.tw',
		to: _to,
		subject: _subject,
		text: '',
		html: _content
	}, function (err, response) {
		cb(err, response);
	});
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
						// var transporter = nodemailer.createTransport();
						// var token = jwt.encode({
						// 	user_id: readUser.user_id,
						// 	expiration: moment().add(30, 'minutes').valueOf()
						// }, config.secret.tokenSecret);
						// var verificationUrl = 'http://' + config.app.domain + ':' + config.app.port.http + '/user/verification?verifyToken=' + token;

						// console.log(readUser);

						// transporter.sendMail({
						// 	from: 'no-reply@entrepreneurclub.tw',
						// 	to: readUser.email,
						// 	subject: 'Email Verification',
						// 	text: 'Email Verification',
						// 	html: 'Hi ' + readUser.name + ',<br>' +
						// 		  'Welcome to [Product Name]<br>' +
						// 		  'The only thing left to do before getting started is to verify this email, which you can do by clicking below:<br>' +
						// 		  '<a href="' + verificationUrl + '">Verify your account</a><br>' +
						// 		  'Alternatively, click the following link: ' +
						// 		  '<a href="' + verificationUrl + '">' + verificationUrl + '</a><br>' +
						// 		  '<br>' +
						// 		  'If you didn\'t sign up for [Product Name], please ignore this email.'
						// }, function (err, response){
						// 	res.reply(err, 'cannot send verification mail: ' + err.name, 'create successfully, please verify your email in 5 minutes', null, null, {
						// 		user_id: readUser.user_id,
						// 		email: readUser.email,
						// 		name: readUser.name
						// 	});
						// });

						var token = jwt.encode({
							user_id: readUser.user_id,
							expiration: moment().add(30, 'minutes').valueOf()
						}, config.secret.tokenSecret);
						var verificationUrl = 'http://' + config.app.domain + ':' + config.app.port.http + '/user/verification?verifyToken=' + token;

						sendMail(
							readUser.email,
							'Email Verification',
							'Hi ' + readUser.name + ',<br>' +
							'Welcome to [Product Name]<br>' +
							'The only thing left to do before getting started is to verify this email, which you can do by clicking below:<br>' +
							'<a href="' + verificationUrl + '">Verify your account</a><br>' +
							'Alternatively, click the following link: ' +
							'<a href="' + verificationUrl + '">' + verificationUrl + '</a><br>' +
							'<br>' +
							'If you didn\'t sign up for [Product Name], please ignore this email.',
							function (err, response) {
								res.reply(err? true: false, 'cannot send verification mail: ' + err.name, 'create successfully, please verify your email in 5 minutes', null, null, {
									user_id: readUser.user_id,
									email: readUser.email,
									name: readUser.name
								}, status.ERR_EMAIL_SEND);
							}
						);
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
					if (!readUser.is_verified) {
						res.reply(err || true, 'please verify your email before logging in', '', null, null, null, status.USER_NOT_VERIFIED);
					} else {
						var user = {
							user_id: readUser.user_id,
							email: readUser.email,
							name: readUser.name
						};
						var token = jwt.encode({
							user: user,
							expiration: moment().add(7, 'days').valueOf()
						}, config.secret.tokenSecret);

						res.reply(err, 'cannot login the user', 'login successfully', null, null, {
							token: token,
							user: user
						});
					}
				}
			});
		});

	router.route('/api/user/logout')
		.get(function (req, res) {
			res.reply(null, '', 'logout successfully');
		});

	router.route('/api/user/recovery')
		.post(function (req, res) {

			console.log(req.body.email);
			// sendMail(req.body.email);
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

	router.route('/user/verification')
		.get(function (req, res) {
			try {
				var decoded = jwt.decode(req.query.verifyToken, config.secret.tokenSecret);
				console.log(decoded.expiration, Date.now());
				if (decoded.expiration <= Date.now()) {
					res.send('Token has expired');
				} else {
					User.updateById(decoded.user_id, {
						is_verified: true
					}, function (err) {
						if (err) throw err;
						res.send('Thanks for your registration, you can login now');
					});
				}
			} catch (err) {
				res.send('Token format error');
			}
		});

	router.get('/mail', function (res, req) {
		var nodemailer = require('nodemailer');
		var transporter = nodemailer.createTransport();

		transporter.sendMail({
		    from: 'no-reply@entrepreneurclub.tw',
		    to: 'gocreating@gmail.com',
		    subject: 'Test',
		    text: 'text',
		    html: 'html'
		}, function (err, response){
		    if (err) {
		    	console.log(err);
		    	if (err.name == 'RecipientError') {
		    		// req.session.err = 'Wrong email address.';
		    	} else if (err.name == 'AuthError') {
		    		// Remember to set up email user and password in config.js
		    		// req.session.err = 'Sender account auth error.';
		    	} else {
		    		// req.session.err = 'Unexpected error.';
		    	}
		    } else {
		        // req.session.succ = 'Thanks for your contact';
		        console.log('succ');
		    }
        	// res.redirect('/contact');
		});
	});
};