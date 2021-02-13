import fc from 'fancy-console';
import config from '../../config';

import express from 'express';
import axios from 'axios';

import Mongoose from '../../helpers/Mongoose';
import Express from '../../helpers/Express';

import APIHelpers from '../../helpers/API';

const router = express.Router();

router.get('/api/songs', async (req, res) => {
	let songList: any[] = [];

	const songs = await Mongoose.songs.find();
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
});


router.post('/api/songs', async (req, res) => {
	const requredKeys = ['songName', 'authorName', 'download'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	const songName = APIHelpers.translitCyrillic(body.songName).trim();
	const authorName = APIHelpers.translitCyrillic(body.authorName).trim();
	const download = body.download.trim();

	if (songName == '' || authorName == '') {
		fc.error(`Музыка ${authorName} - ${songName} не опубликована: пустое имя автора или музыки`);
		return res.json({
			'status': 'error',
			'code': 'emptySongOrAuthorName'
		});
	}

	const checkSong = await Mongoose.songs.findOne({
		name: new RegExp(songName, 'i'),
		authorName: new RegExp(authorName, 'i')
	});

	const checkUrl = await Mongoose.songs.findOne({
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
		if (download == '' || !await APIHelpers.verifySongUrl(download)) {
			fc.error(`Музыка ${authorName} - ${songName} не опубликована: неверный URL`);
			return res.json({
				'status': 'error',
				'code': 'invalidUrl'
			});
		}

		const song = new Mongoose.songs({
			songID: (await Mongoose.songs.countDocuments()) + 5000000 + 1,
			name: songName,
			authorID: 9,
			authorName: authorName,
			size: 0,
			download: download
		});

		song.save();

		axios.post(config.webhook, {
			"content": null,
			"embeds": [
				{
					"title": "Song Uploaded",
					"color": 5814783,
					"fields": [
						{
							"name": `${authorName} - ${songName}`,
							"value": `${song.songID}`
						}
					],
					"footer": {
						"text": "ZeroCore Webhook"
					},
					"timestamp": new Date().toISOString()
				}
			]
		});

		fc.success(`Музыка ${authorName} - ${songName} опубликована`);
		return res.json({
			'status': 'success',
			'value': song.songID
		});
	}
});

router.get('/api/:id', async (req, res) => {
	const body = req.body;
	let songList: any[] = [];
});

export { router };