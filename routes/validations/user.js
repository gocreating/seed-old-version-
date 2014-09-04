var checkData = require('./checkData');
var captcha = require('../middlewares/captcha');

module.exports = function (router) {
	router.post('/api/user', captcha, function (req, res, next) {
		checkData.check([
			{field: 'email',     value: req.body.email,     checkers: checkData.checker.email,      required: true},
			{field: 'password',  value: req.body.password,  checkers: checkData.checker.password,   required: true},
			{field: 'name',      value: req.body.name,      checkers: checkData.checker.personName, required: true},
			{field: 'sex',       value: req.body.sex,       checkers: checkData.checker.sex,        required: true},
			{field: 'birthday',  value: req.body.birthday,  checkers: checkData.checker.birthday},
			{field: 'phone',     value: req.body.phone,     checkers: checkData.checker.phone},
			{field: 'address',   value: req.body.address,   checkers: checkData.checker.address}
		], checkData.checkCallBack(req, res, next));
	});
};