const fc = require('fancy-console');

module.exports = {
	path: 'tools/songs/list',
	aliases: [],
	requiredKeys: [],
	async execute(req, res, body, server) {
		res.render('songList');
	}
}