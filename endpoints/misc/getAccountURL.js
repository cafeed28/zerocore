const fc = require('fancy-console');

module.exports = {
	path: 'getAccountURL.php',
	aliases: ['getAccountURL'],
	requiredKeys: [],
	async execute(req, res, body, server) {
		return res.send('http://' + req.headers.host + req.url);
	}
}