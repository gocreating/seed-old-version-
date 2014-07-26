var render404 = function (req, res) {
	return function () {
		res.status(404);
		if (req.is('json')) { // respond with json
			res.reply({}, 0x00000001, 'page not found');
		} else {              // respond with html page
			res.render('special/404');
		}
	};
};

var render403 = function (req, res) {
	return function () {
		res.status(403);
		if (req.is('json')) { // respond with json
			res.reply({}, 0x00000002, 'permission denied');
		} else {              // respond with html page
			res.render('special/403');
		}
	};
};

var render401 = function (req, res) {
	return function () {
		res.status(401);
		if (req.is('json')) { // respond with json
			res.reply({}, 0x00000003, 'unauthorized');
		} else {              // respond with html page
			res.render('special/401');
		}
	};
};

var render423 = function (req, res) {
	return function () {
		res.status(423);
		if (req.is('json')) { // respond with json
			res.reply({}, 0x00000004, 'already authorized');
		} else {              // respond with html page
			res.render('special/423');
		}
	};
};

module.exports = function (req, res, next) {
	res.render401 = render401(req, res);
	res.render403 = render403(req, res);
	res.render404 = render404(req, res);
	res.render423 = render423(req, res);
	next();
};