module.exports = function (req, res, next) {
	res.reply = function (_customValue, _errCode, _msg, _status) {
		// _customValue = _customValue || {};
		// _errCode = _errCode || 0;
		// _msg = _msg || getMsg(_errCode);
		// _status = _status || getStatus(_errCode);
		// res.status(_status);
		if (_errCode instanceof Error) {
			res.status(500);
			res.send({
				error: true,
				errCode: 1,
				msg: _msg || 'server error',
				value: _customValue || {}
			});
		} else {
			if (_errCode) {
				res.send({
					error: true,
					errCode: _errCode,
					msg: _msg,
					value: _customValue || {}
				});
			} else {
				res.send({
					error: false,
					errCode: 0,
					msg: 'OK',
					value: _customValue || {}
				});
			}
		}
	}
	next();
};