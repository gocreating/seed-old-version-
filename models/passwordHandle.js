// https://gist.github.com/soplakanets/980737
var crypto = require('crypto');
var config = require('../config');

function createHash(password) {
	var hash = md5(password + config.secret.passwordSalt);
	return hash;
}

function validateHash(hash, password) {
	var validHash = md5(password + config.secret.passwordSalt);
	return hash === validHash;
}
 
function md5(string) {
	return crypto.createHash('md5').update(string).digest('hex');
}

module.exports = {
	hash: createHash,
	validate: validateHash
};