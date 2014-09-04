var jwt = require('jwt-simple');
var status = require('../../status');
var config = require('../../config');

module.exports = function (req, res, next) {
	var token = (req.body && req.body.token) ||
				(req.query && req.query.token) ||
				req.headers['x-access-token'];
	// console.log('token: ' + token);
	if (token) {
		try {
			var decoded = jwt.decode(token, config.secret.tokenSecret);
			if (decoded.expiration <= Date.now()) {
				res.reply(true, 'token has expired', '', 400, null, null, status.TOKEN_EXPIRATION);
				return;
			} else {
				req.user = decoded.user;
			}
		} catch (err) {
			res.reply(true, 'cannot decode token', '', 400, null, null, status.TOKEN_WRONG_FORMAT);
			return;
		}
	}
	next();
};