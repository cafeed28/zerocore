import fc from 'fancy-console';
import config from '../../config';

import axios from 'axios';

import Mongoose from '../../helpers/classes/Mongoose';
import WebHelper from '../../helpers/classes/WebHelper';

import APIHelpers from '../../helpers/classes/API';

async function router(router: any, options: any) {
	router.get(`/${config.basePath}/api/songs`, async (req: any, res: any) => {
		let songList: any[] = [];

		const songs = await Mongoose.songs.find();
		songs.map(song => {
			songList.push({
				songID: song.songID,
				name: song.name,
				authorName: song.authorName,
				download: song.download
			});
		});

		return {
			'status': 'success',
			'value': songList
		};
	});


	router.post(`/${config.basePath}/api/songs`, async (req: any, res: any) => {
		const requredKeys = ['songName', 'authorName', 'download'];
		const body = req.body;
		if (!WebHelper.checkKeys(body, requredKeys)) {
			fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
			return res.code(400).send('-1');
		}

		const songName = APIHelpers.translitCyrillic(body.songName).trim();
		const authorName = APIHelpers.translitCyrillic(body.authorName).trim();
		const download = body.download.trim();

		if (songName == '' || authorName == '') {
			fc.error(`Музыка ${authorName} - ${songName} не опубликована: пустое имя автора или музыки`);
			return {
				'status': 'error',
				'code': 'emptySongOrAuthorName'
			};
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
			return {
				'status': 'error',
				'code': 'alreadyUploaded',
				'value': checkSong ? checkSong.songID : checkUrl.songID
			};
		} else {
			if (download == '' || !await APIHelpers.verifySongUrl(download)) {
				fc.error(`Музыка ${authorName} - ${songName} не опубликована: неверный URL`);
				return {
					'status': 'error',
					'code': 'invalidUrl'
				};
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
			return {
				'status': 'success',
				'value': song.songID
			};
		}
	});

	router.get(`/${config.basePath}/api/songs/:id`, async (req: any, res: any) => {
		const body = req.body;
		let songList: any[] = [];
	});
}

export { router };