var User = require('../../models/user');
var status = require('../../status');
var jwt = require('jwt-simple');
var moment = require('moment');
var config = require('../../config');
var passport = require('passport'),
	FacebookStrategy = require('passport-facebook').Strategy,
	TwitterStrategy = require('passport-twitter').Strategy,
	GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.serializeUser(function (user, done) {
	done(null, user.user_id);
});

passport.deserializeUser(function (id, done) {
	User.readById(id, function (err, readUser) {
		done(err, readUser);
	});
});

// Facebook Strategy
passport.use(new FacebookStrategy({
	clientID: config.social.facebook.clientID,
	clientSecret: config.social.facebook.clientSecret,
	callbackURL: config.social.callback_root + '/auth/facebook/callback',
	enableProof: config.social.facebook.enableProof
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

// Twitter Strategy
passport.use(new TwitterStrategy({
	consumerKey: config.social.twitter.consumerKey,
	consumerSecret: config.social.twitter.consumerSecret,
	callbackURL: config.social.callback_root + '/auth/twitter/callback'
}, function (token, tokenSecret, profile, done) {
	User.socialLogin({
		user_type: User.USER_TYPE.TWITTER,
		open_id: profile.id,
		email: profile.username,
		password_hash: '',
		name: profile.displayName,
		sex: User.SEX_TYPE.UNKNOWN,
		birthday: '',
		extra: profile._raw,
		create_at: new Date(),
		update_at: new Date()
	}, function (err, readUser) {
		return done(err, readUser);
	});
}));

// Google OAuth2Strategy
passport.use(new GoogleStrategy({
	clientID: config.social.google.clientID,
    clientSecret: config.social.google.clientSecret,
    callbackURL: config.social.callback_root + '/auth/google/callback'
}, function (accessToken, refreshToken, profile, done) {
	// only verified email can be used to register a new account
	if (profile._json.verified_email) {
		User.socialLogin({
			user_type: User.USER_TYPE.GOOGLE,
			open_id: profile.id,
			email: profile._json.email,
			password_hash: '',
			name: profile.displayName,
			sex: (profile._json.gender==='male'? User.SEX_TYPE.MALE: (profile._json.gender==='female'? User.SEX_TYPE.FEMALE: User.SEX_TYPE.UNKNOWN)),
			birthday: '',
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

	router.get('/auth/twitter',
		passport.authenticate('twitter'));

	router.route('/auth/twitter/callback')
		.get(function (req, res, next) {
			passport.authenticate('twitter', function (err, readUser, info) {
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

	router.get('/auth/google',
		passport.authenticate('google', {scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']}));

	router.route('/auth/google/callback')
		.get(function (req, res, next) {
			passport.authenticate('google', function (err, readUser, info) {
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
};