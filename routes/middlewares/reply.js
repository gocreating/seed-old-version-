var status = require('../../status');

module.exports = function (req, res, next) {
	res.reply = function (isErr, _msgErr, _msgNoErr, _statusErr, _statusNoErr, _data, _code) {
		if (isErr instanceof Error) {
			res.status(500);
			res.send({
				status: 500,
				code: status.INTERNAL_SERVER_ERROR,
				message: 'internal server error: ' + _msgErr,
				data: null
			});
		} else {
			_statusErr = _statusErr || 200;
			_statusNoErr = _statusNoErr || 200;
			_data = _data || null;
			_code = _code || status.OK;

			if (isErr) {
				_msgErr = _msgErr || 'error';
				res.status(_statusErr);
				res.send({
					status: _statusErr,
					code: _code,
					message: _msgErr,
					data: _data
				});
			} else {
				_msgNoErr = _msgNoErr || 'success';
				res.status(_statusNoErr);
				res.send({
					status: _statusNoErr,
					code: _code,
					message: _msgNoErr,
					data: _data
				});
			}
		}
	};
	next();
};