var User = require('../../models/user');
var pswd = require('../../models/passwordHandle');
var status = require('../../status');
var jwt = require('jwt-simple');
var moment = require('moment');
var config = require('../../config');
var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy;

passport.serializeUser(function (user, done) {
	done(null, user.user_id);
});

passport.deserializeUser(function (id, done) {
	User.read(id, function (err, readUser) {
		done(err, readUser);
	});
});

passport.use(new FacebookStrategy({
	clientID:     '1491303634446526',
	clientSecret: 'd76344f1ecffb497055eb29383fca8e9',
	callbackURL:  'http://entrepreneurclub.tw:5000/auth/facebook/callback',
	enableProof:  false
}, function (accessToken, refreshToken, profile, done) {
	// only verified email can be used to register a new account
	if (profile._json.verified) {
		User.socialLogin({
			user_type: User.USER_TYPE.FACEBOOK,
			open_id: profile.id,
			email: profile._json.email,
			password_hash: '',
			name: profile._json.name,
			sex: (profile._json.gender==='male'? User.SEX_TYPE.MALE: User.SEX_TYPE.FEMALE),
			birthday: new Date(profile._json.birthday),
			extra: profile._raw,
			create_at: new Date(),
			update_at: new Date()
		}, function (err, readUser) {
			return done(err, readUser);
		});
	} else {
		return done(null, null);
	}
}));

module.exports = function (router) {
	router.get('/auth/facebook',
		passport.authenticate('facebook', {
			display: 'page',
			scope: [
				'email',
				'user_about_me',
				'user_birthday',
				'user_education_history',
				'user_hometown',
				'user_location'
			]
		}));

	// http://stackoverflow.com/questions/21855650/passport-authenticate-callback-is-not-passed-req-and-res
	router.route('/auth/facebook/callback')
		.get(function (req, res, next) {
			passport.authenticate('facebook', function (err, readUser, info) {
				if (!readUser) {
					res.replyByRedirect('/user/login', 'cannot login the user', 200, null, status.ERR_SOCIAL_LOGIN);
				} else {
					var user = {
						user_id: readUser.user_id,
						email: readUser.email,
						name: readUser.name
					};
					var token = jwt.encode({
						user: user,
						expiration: moment().add('days', 7).valueOf()
					}, config.secret.tokenSecret);

					res.replyByRedirect('/', 'login successfully', 200, {
						token: token,
						user: user
					}, status.SUCC_SOCIAL_LOGIN);
				}
			}) (req, res, next)
		});

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
						res.reply(err, 'cannot create the new user', 'create successfully', null, null, {
							user_id: readUser.user_id,
							email: readUser.email,
							name: readUser.name
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
						email: readUser.email,
						name: readUser.name
					};
					var token = jwt.encode({
						user: user,
						expiration: moment().add('days', 7).valueOf()
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