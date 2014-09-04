module.exports = function (req, res, next) {
	// Redirect to the URL that angular can accept
	res.redirect('/#!' + req.path);
};