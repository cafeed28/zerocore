import fc from 'fancy-console';

import axios from 'axios';
import express from 'express';

import Mongoose from '../helpers/Mongoose';
import Express from '../helpers/Express';

const router = express.Router();

router.post('/getGJSongInfo(.php)?', async (req, res) => {
	const requredKeys = ['songID', 'secret'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	const songID = body.songID;

	const song = await Mongoose.songs.findOne({ songID: songID });

	if (!song && songID > 5000000) {
		fc.error(`Получение информации музыки ${songID} не удалось: кастомная музыка не найдена`);
		return res.send('-1');
	} else if (song) {
		let download = song.download;
		if (download.includes(':')) {
			download = encodeURIComponent(download);
		}

		let result = `1~|~${song.songID}~|~2~|~${song.name}~|~3~|~${song.authorID}~|~4~|~${song.authorName}~|~5~|~${song.size}~|~6~|~~|~10~|~${download}~|~7~|~~|~8~|~0`;

		fc.success(`Получение информации музыки ${songID} удалось`);
		return res.send(result);
	}

	let songString = '';

	let params = new URLSearchParams();
	params.append('songID', songID);
	params.append('secret', body.secret);

	const bRes = await axios.post('http://www.boomlings.com/database/getGJSongInfo.php', params);
	songString = bRes.data;

	if (bRes.data == '-2' || bRes.data == '-1' || bRes.data == '') {
		fc.error(`Получение информации музыки ${songID} не удалось: музыка не найдена`);
		return res.send('-1');
	}

	fc.success(`Получение информации музыки ${songID} удалось`);
	return res.send(songString);
});

export { router };