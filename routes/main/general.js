var status = require('../../status');
var config = require('../../config');
var nodemailer = require('nodemailer');

module.exports = function (router) {
	router.route('/api/contact')
		.post(function (req, res) {
			var ses = require('nodemailer-ses-transport');
			var transporter = nodemailer.createTransport(ses({
				accessKeyId: config.email.ses.accessKeyId,
				secretAccessKey: config.email.ses.secretAccessKey
			}));

			var fromName = req.body.name || 'Unknown';
			var fromMail = req.body.email;
			var subject = req.body.subject || 'Untitled';
			var content = req.body.message;

			transporter.sendMail({
				from: 'no-reply@entrepreneurclub.tw',
				to: config.email.receiver.join(','),
				subject: 'User Feedback: ' + subject,
				text: 'User Feedback',
				html: 'From ' + fromName + '&lt;' + fromMail + '&gt;<br><br>' +
				      '<hr><br>' +
				      content.replace(/\n/g, '<br>')
			}, function (err, response) {
				if (err) {
					res.reply(true, '', '', null, null, null, status.ERR_EMAIL_SEND);
				} else {
					res.reply(false, '', 'Thanks for your feedback');
				}
			});
		})
};