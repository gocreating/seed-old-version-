var checkData = require('./checkData');
var mw = require('../routes/middlewares');

// Routing
module.exports = function(app) {
	// Register
	app.get('/user/register', mw.unauth, function (req, res, next) {
		next();
	});

	app.post('/api/user/register', mw.unauth, mw.checkCaptcha('register', '/user/register'), function (req, res, next) {
		checkData.check([
			{
				field: 'email',
				value: req.body.email,
				required: true,
				checkers: checkData.checker.email
			},
			{
				field: 'password',
				value: req.body.password,
				required: true,
				checkers: checkData.checker.password
			},
			{
				field: 'name',
				value: req.body.name,
				required: true,
				checkers: checkData.checker.personName
			},
			{
				field: 'sex',
				value: req.body.sex,
				required: true,
				checkers: checkData.checker.sex
			},
			{
				field: 'id_number',
				value: req.body.id_number,
				checkers: checkData.checker.idNumber
			},
			{
				field: 'birthday',
				value: req.body.birthday,
				checkers: checkData.checker.birthday
			},
			{
				field: 'phone',
				value: req.body.phone,
				checkers: checkData.checker.phone
			},
			{
				field: 'address',
				value: req.body.address,
				checkers: checkData.checker.address
			}
		], checkData.checkCallBack(req, res, next));
	});

	// Login
	app.get('/user/login', mw.unauth, function (req, res, next) {
		next();
	});

	app.post('/user/login', mw.unauth, mw.checkCaptcha('login', '/user/login'), function (req, res, next) {
		checkData.check([
			{
				field: 'email',
				value: req.body.email,
				required: true,
				checkers: checkData.checker.email
			},
			{
				field: 'password',
				value: req.body.password,
				required: true,
				checkers: checkData.checker.password
			}
		], checkData.checkCallBack(req, res, next));
	});

	// Logout
	app.get('/user/logout', mw.authCustomer, function (req, res, next) {
		next();
	});

	// Edit
	app.get('/user/edit', mw.authCustomer, function (req, res, next) {
		next();
	});

	app.put('/api/user/edit', mw.authCustomer, function (req, res, next) {
		checkData.check([
			{
				field: 'name',
				value: req.body.name,
				required: true,
				checkers: checkData.checker.personName
			},
			{
				field: 'sex',
				value: req.body.sex,
				required: true,
				checkers: checkData.checker.sex
			},
			{
				field: 'id_number',
				value: req.body.id_number,
				checkers: checkData.checker.idNumber
			},
			{
				field: 'birthday',
				value: req.body.birthday,
				checkers: checkData.checker.birthday
			},
			{
				field: 'phone',
				value: req.body.phone,
				checkers: checkData.checker.phone
			},
			{
				field: 'address',
				value: req.body.address,
				checkers: checkData.checker.address
			}
		], checkData.checkCallBack(req, res, next));
	});
};