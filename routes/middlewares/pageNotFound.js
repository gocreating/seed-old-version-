module.exports = function (req, res, next) {
	res.render404()
	next();
};