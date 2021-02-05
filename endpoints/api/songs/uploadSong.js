const fc = require('fancy-console');
const { verifySongUrl, translitCyrillic } = require('../../../lib/apiLib');

module.exports = {
	path: 'api/songs/upload',
	aliases: [],
	requiredKeys: ['songName', 'authorName', 'download'],
	async execute(req, res, body, server) {
		const songName = translitCyrillic(body.songName);
		const authorName = translitCyrillic(body.authorName);
		const download = body.download;

		if (songName == '' || authorName == '') {
			fc.error(`Музыка ${authorName} - ${songName} не опубликована: пустое имя автора или музыки`);
			return res.json({
				'status': 'error',
				'code': 'emptySongOrAuthorName'
			});
		}

		const checkSong = await server.songs.findOne({
			name: new RegExp(songName, 'i'),
			authorName: new RegExp(authorName, 'i')
		});

		const checkUrl = await server.songs.findOne({
			download: download
		});

		if (checkSong || checkUrl) {
			fc.error(`Музыка ${authorName} - ${songName} не опубликована: такая музыка уже есть`);
			return res.json({
				'status': 'error',
				'code': 'alreadyUploaded',
				'value': checkSong ? checkSong.songID : checkUrl.songID
			});
		} else {
			if (download == '' || !await verifySongUrl(download)) {
				fc.error(`Музыка ${authorName} - ${songName} не опубликована: неверный URL`);
				return res.json({
					'status': 'error',
					'code': 'invalidUrl'
				});
			}

			const song = new server.songs({
				songID: (await server.songs.find().sort({ _id: -1 }).limit(1))[0].songID + 5000000 + 1,
				name: songName,
				authorID: 9,
				authorName: authorName,
				size: 0,
				download: download
			});

			song.save();

			fc.success(`Музыка ${authorName} - ${songName} опубликована`);
			return res.json({
				'status': 'success',
				'value': song.songID
			});
		}
	}
}