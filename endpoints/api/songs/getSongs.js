const fc = require('fancy-console');

module.exports = {
	path: 'api/songs/list',
	aliases: [],
	requiredKeys: [],
	async execute(req, res, body, server) {
		let songList = [];

		const songs = await server.songs.find();
		songs.map(song => {
			songList.push({
				songID: song.songID,
				name: song.name,
				authorName: song.authorName,
				download: song.download
			});
		})

		return res.json({
			'status': 'success',
			'value': songList
		});
	}
}