const fc = require('fancy-console');

module.exports = {
	path: 'tools/songs/upload',
	aliases: [],
	requiredKeys: [],
	async execute(req, res, body, server) {
		res.render('uploadSong');
	}
}