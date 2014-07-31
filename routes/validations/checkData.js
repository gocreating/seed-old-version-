var validator = require('validator');
var status = require('../../status');

/**
 * Default Validation Function Configurations
 */
exports.checker = {
	email: [
		{func: validator.isLength, args: [3, 63], msg: 'Length must between 3 to 63'},
		{func: validator.isEmail, msg: 'Not an email'}
	],
	password: [
		{func: validator.isLength, args: [8, 30], msg: 'Length must between 8 to 30'},
		{func: validator.isAlphanumeric, msg: 'Only accepts letters and numbers'}
	],
	personName: [
		{func: validator.isLength, args: [1, 15], msg: 'Length must between 1 to 15'}
	],
	sex: [
		{func: validator.isLength, args: [1], msg: 'You must select an option'},
		{func: validator.isIn, args: [['0', '1', '2']], msg: 'Error format'}
	],
	birthday: [
		{func: validator.isLength, args: [1, 31], msg: 'Length must between 1 to 31'},
		{func: validator.isDate, msg: 'Not a date'}
	],
	phone: [
		{func: validator.isLength, args: [1, 15], msg: 'Length must between 1 to 15'},
		{func: validator.isNumeric, msg: 'Must contain only numbers'}
	],
	address: [
		{func: validator.isLength, args: [1, 127], msg: 'Length must between 1 to 127'}
	],
	id: [
		{func: validator.isLength, args: [1, 31], msg: 'Length must between 1 to 31'},
		{func: validator.isNumeric, msg: 'Must contain only numbers'}
	],
	content: [
		{func: validator.isLength, args: [1, 255], msg: 'Length must between 1 to 255'}
	]
};

/**
 * Customized validation
 *
 * @param checkItems
 *     The customized validation field, conditions and messages
 *     Formatting example:
 *         [
 *             {
 *                 field: 'email',
 *                 value: req.query.email,
 *                 required: true,
 *                 checkers: [
 *                     {func:validator.isEmail, msg: 'Format error'},
 *                     {func:validator.isLength, args: [1, 63], msg: 'Length error'}
 *                 ]
 *             }
 *         ]
 *
 * Reference
 *     http://stackoverflow.com/questions/676721/calling-dynamic-function-with-dynamic-parameters-in-javascript
 */
exports.check = function (checkItems, cb) {
	var isErr = false;
	var errMsg = [];

	checkItems.forEach(function (checkItem) {
		var tmpMsg = [];
		if (checkItem.required || (!checkItem.required && !validator.isNull(checkItem.value))) {
			checkItem.checkers.forEach(function (checker) {
				if (checker.args) {
					var params = checker.args.slice(0);
					params.unshift(checkItem.value);
					if (checker.func.apply(this, params) == false) {
						tmpMsg.push(checker.msg);
						isErr = true;
					}
				} else {
					if (checker.func(checkItem.value) == false) {
						tmpMsg.push(checker.msg);
						isErr = true;
					}
				}
			});
		}

		if (tmpMsg.length) {
			errMsg.push({field: checkItem.field, msg: tmpMsg});
		}
	});

	// Return result
	if (isErr) {
		cb(true, errMsg);
	} else {
		cb(false);
	}
};

exports.checkCallBack = function (req, res, next) {
	return function (isInvalid, detail) {
		if (isInvalid) {
			// Validation error

			// http://expressjs.com/4x/api.html#req.get
			if (req.is('json')) {
				// respond with json
				res.reply(detail, status.ERR_VALIDATION, 'validation error');
				return;
			} else {
				// respond with html page
				// req.session.err = result;
				// res.redirect(req.url);
				return;
			}
		} else {
			// Validation pass
			next();
		}
	};
};