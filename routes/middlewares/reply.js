module.exports = function (req, res, next) {
	res.reply = function (_customValue, _errCode, _msg, _status) {
		_customValue = _customValue || {};
		_errCode = _errCode || 0;
		// _msg = _msg || getMsg(_errCode);
		// _status = _status || getStatus(_errCode);
		// res.status(_status);
		res.send({
			errCode: _errCode,
			msg: _msg,
			value: _customValue
		});
	}
	next();
};