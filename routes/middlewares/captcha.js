var config = require('../../config');
var status = require('../../status');
var Recaptcha = require('recaptcha').Recaptcha;

module.exports = function (req, res, next) {
	var recaptcha = new Recaptcha(null, config.recaptcha.private_key, {
		remoteip:  req.connection.remoteAddress,
		challenge: req.body.captcha.challenge,
		response:  req.body.captcha.response
	});

	recaptcha.verify(function (success, error_code) {
		// debugging
		success = true;
		// end debuging
		if (!success) {
			res.reply(true, 'wrong captcha', '', null, null, null, status.WRONG_CAPTCHA);
		} else {
			next();
		}
	});
};