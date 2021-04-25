import fc from 'fancy-console';
import fs from 'fs-jetpack';
import config from '../config';

import zlib from 'node-gzip';
import axios from 'axios';

import WebHelper from '../helpers/classes/WebHelper';
import GJCrypto from '../helpers/classes/GJCrypto';
import GJHelpers from '../helpers/classes/GJHelpers';
import XOR from '../helpers/classes/XOR';

import { ILevel, LevelModel } from '../helpers/models/level';
import { DailyModel } from '../helpers/models/daily';
import { GauntletModel } from '../helpers/models/gauntlet';
import EPermissions from '../helpers/EPermissions';

async function router(router: any, options: any) {
	router.post(`/${config.basePath}/downloadGJLevel22.php`, async (req: any, res: any) => {
		const requredKeys = ['levelID'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		let levelID = body.levelID;

		const time = Math.round(new Date().getTime() / 1000);
		// робтоп сука ну нахера так делать
		if (levelID == '-1') {
			let daily = await DailyModel.findOne({
				timestamp: {
					$lt: time
				},
				type: 0
			});

			levelID = daily.levelID;
			var feaID = daily.feaID;
		}
		// можно же было просто после getGJDailyLevel скачивать уровени с id который тебе вернули, а не -1 и -2
		else if (levelID == '-2') {
			let daily = await DailyModel.findOne({
				timestamp: {
					$lt: time
				},
				type: 1
			});

			levelID = daily.levelID;
			var feaID = daily.feaID + 100001;
		}

		const level = await LevelModel.findOne({ levelID: levelID })

		if (!level) {
			fc.error(`Скачивание уровня ${levelID} не выполнено: уровень не найден в бд`);
			return '-1';
		}

		let levelString = '';
		try {
			levelString = await fs.readAsync(`data/levels/${levelID}`, 'utf8');
		} catch (e) {
			fc.error(`Скачивание уровня ${levelID} не выполнено: ошибка скачивания`);
			fc.error(e);
			return '-1';
		}

		if (!levelString) {
			fc.error(`Скачивание уровня ${levelID} не выполнено: файл уровня не найден`);
			return '-1';
		}

		await LevelModel.findOneAndUpdate({ levelID: levelID }, { downloads: level.downloads + 1 });

		let pass = level.password;
		if (GJHelpers.getAccountPermission(body.accountID, EPermissions.freeCopy)) pass = 1
		if (pass != 0) {
			var xorPass = Buffer.from(XOR.cipher(pass.toString(), 26364)).toString('base64');
		}
		else var xorPass = pass.toString();

		if (levelString.substr(0, 3) == 'kS1') {
			levelString = Buffer.from(await zlib.gzip(levelString)).toString('base64');
			levelString = levelString.replace('/', '_');
			levelString = levelString.replace('+', '-');
		}

		let response = GJHelpers.jsonToRobtop([{
			'1': level.levelID,
			'2': level.levelName,
			'3': level.levelDesc,
			'4': levelString,
			'5': 1,
			'6': level.accountID,
			'8': 10,
			'9': level.starDifficulty,
			'10': level.downloads,
			'11': 1,
			'12': level.audioTrack,
			'13': 21,
			'14': level.likes,
			'15': level.levelLength,
			'17': +level.starDemon,
			'18': level.starStars,
			'19': +level.starFeatured,
			'25': +level.starAuto,
			'27': xorPass,
			'28': level.uploadDate,
			'29': level.updateDate,
			'30': level.original,
			'31': 1,
			'35': level.songID,
			'36': level.extraString,
			'37': level.coins,
			'38': +level.starCoins,
			'39': level.requestedStars,
			'40': level.ldm,
			'42': +level.starEpic,
			'43': level.starDemonDiff,
			'45': level.objects,
			'46': 1,
			'47': 2,
			'48': 1,
		}]);

		if (feaID) response += `:41:${feaID}`;

		response += `#${GJCrypto.genSolo(levelString)}#`;

		let someString: any = [
			level.accountID,
			level.starStars,
			+level.starDemon,
			level.levelID,
			+level.starCoins,
			+level.starFeatured, pass, 0
		]
		if (feaID) someString[someString.length = feaID];
		someString = someString.join(',');

		response += GJCrypto.genSolo2(someString) + '#';
		if (feaID) response += await GJHelpers.getUserString(level.accountID);
		else response += someString;

		fc.success(`Скачивание уровня ${levelID} выполнено`);
		return response;
	});

	router.post(`/${config.basePath}/getGJDailyLevel.php`, async (req: any, res: any) => {
		const body = req.body;

		let type = body.weekly || 0;
		if (type == 0) { // daily
			var midnight = Math.round(new Date(new Date().setUTCHours(24, 0, 0)).getTime() / 1000); // next midnight
		}
		else { // weekly
			const d = new Date();
			var midnight = Math.round(new Date(d.setUTCDate(d.getUTCDate() + (1 + 7 - d.getUTCDay()) % 7)).getTime() / 1000); // next monday
		}

		const time = Math.round(new Date().getTime() / 1000);

		let daily = await DailyModel.findOne({
			timestamp: {
				$lt: time
			},
			type: type
		});

		if (!daily) {
			fc.error('Получение ежедневных уровней не выполнено: ежедневный уровень не найден');
			return '-1';
		}

		let dailyID = daily.levelID;

		if (type == 1) { //weekly
			dailyID += 100001; // fuck robtop...
		}

		let timeleft = midnight - time;

		// робтоп ты под чем писал это, ты получаешь айди дейли и потом качаешь уровень -1 или -2
		let result = `${dailyID}|${timeleft}`;
		fc.success('Получение ежедневных уровней выполнено');
		return result;
	});

	router.post(`/${config.basePath}/getGJLevels21.php`, async (req: any, res: any) => {
		const body = req.body;

		const page = parseInt(body.page);

		let levelsList = [];
		let levelsMultiString = '';
		let usersList = [];
		let songsList = [];

		let params: any = {};
		let orderBy: any = {};

		let diff = body.diff || '-';

		if (!parseInt(body.str)) params.levelName = new RegExp(body.str, 'i');
		else params.levelID = body.str; // search one by ID

		// search levels by IDs like '4,5,6' = [4, 5, 6]
		if (body.str)
			if (body.str.includes(',')) params = { levelID: { $in: body.str.split(',').map(Number) } };

		if (body.featured == 1) params.starFeatured = 1;
		if (body.original == 1) params.original = 0;
		if (body.epic == 1) params.epic = 1;

		if (body.uncompleted == 1 && body.completedLevels) {
			let completed = body.completedLevels.replace(/[^0-9,]/g, '').split(',');
			params.levelID = { $nin: completed };
		}
		if (body.onlyCompleted == 1 && body.completedLevels) {
			let completed = body.completedLevels.replace(/[^0-9,]/g, '').split(',');
			params.levelID = { $in: completed };
		}

		if (body.type == 0 || body.type == 15) { // 15 in gdw, idk for what
			orderBy = { likes: -1 };
			if (body.str) {
				if (!isNaN(body.str)) {
					params = { levelID: body.str };
				}
			}
		}
		else if (body.type == 1) {
			orderBy = { downloads: -1 };
		}
		else if (body.type == 2) {
			orderBy = { likes: -1 };
		}
		else if (body.type == 3) { // trending
			orderBy = { uploadDate: { $lt: Math.round(Date.now() / 1000) - (7 * 24 * 60 * 60) } };
		}
		else if (body.type == 4) {
			orderBy = { levelID: -1 };
		}
		else if (body.type == 5) {
			params.accountID = body.str;
			orderBy = { levelID: -1 };
		}
		else if (body.type == 7) { // magic
			params.objects = { $gt: 9999 };
		}
		else if (body.type == 11) { // awarded
			params.starStars = { $gt: 0 };
			orderBy = { rateDate: -1, uploadDate: -1 };
		}
		else if (body.type == 12) { // followed
			params.accountID = { $in: body.followed.split(',') };
		}
		else if (body.type == 13) { // friends
			if (await GJCrypto.gjpCheck(body.gjp, body.accountID)) {
				// todo: implement
				params = {};
			}
		}

		if (body.coins == 1) {
			params.starCoins = 1;
			params.coins = 0;
		}

		if (body.song) {
			if (!body.customSong) {
				params.audioTrack = parseInt(body.song) - 1;
				params.songID = 0;
			} else {
				params.songID = parseInt(body.song);
			}
		}

		if (body.twoPlayer == 1) params.twoPlayer = 1;
		if (body.star) params.starStars != 0;
		if (body.noStar) params.starStars = 0;

		if (body.len && body.len != '-') {
			params.levelLength = { $in: parseInt(body.len.split(',')) };
		}

		if (body.gauntlet) {
			orderBy = {};
			let gauntlet = await GauntletModel.findOne({
				packID: body.gauntlet
			});

			let lvls = [
				gauntlet.levelID1,
				gauntlet.levelID2,
				gauntlet.levelID3,
				gauntlet.levelID4,
				gauntlet.levelID5
			]

			params = { levelID: { $in: lvls.map(Number) } };
		}

		if (diff == -1) {
			params.starDifficulty = 0;
		}
		else if (diff == -3) {
			params.starAuto = true;
		}
		else if (diff == -2) {
			let filter = parseInt(body.demonFilter) || 0;

			params.starDemon = true;
			if (filter == 1) params.starDemonDiff = 3;
			if (filter == 2) params.starDemonDiff = 4;
			if (filter == 3) params.starDemonDiff = 0;
			if (filter == 4) params.starDemonDiff = 5;
			if (filter == 5) params.starDemonDiff = 6;
		}
		else {
			if (body.diff && body.diff != '-') {
				body.diff = body.diff.replace(',', '0,') + '0';
				body.diff = body.diff.split(',');
				params.starDifficulty = { $in: body.diff };
			}
		}

		console.log(params);
		console.log(orderBy);

		const levels = await LevelModel.find(params).sort(orderBy).skip(page * 10).limit(10);
		const levelsCount = await LevelModel.countDocuments(params);

		if (!levels.length) {
			fc.error(`Получение уровней не выполнено: уровни не найдены`);
			return '-1';
		} else {
			for (const level of levels) {
				if (level.unlisted == 1) continue;

				levelsMultiString += level.levelID + ',';

				if (level.songID != 0) {
					const song = await GJHelpers.getSongString(level.songID);
					if (song) songsList.push(song);
				}

				const user = await GJHelpers.getUserString(level.accountID)
				usersList.push(user);

				const levelString = GJHelpers.jsonToRobtop([{
					'1': level.levelID,
					'2': level.levelName,
					'3': level.levelDesc,
					'5': level.levelVersion || 0,
					'6': level.accountID,
					'8': 10,
					'9': level.starDifficulty,
					'10': level.downloads,
					'12': level.audioTrack,
					'13': 21,
					'14': level.likes,
					'15': level.levelLength,
					'17': +level.starDemon,
					'18': +level.starStars,
					'19': +level.starFeatured,
					'25': +level.starAuto,
					'30': level.original,
					'31': '0',
					'35': level.songID,
					'37': level.coins,
					'38': +level.starCoins,
					'39': level.requestedStars,
					'40': level.ldm,
					'42': +level.starEpic,
					'43': level.starDemonDiff,
					'45': level.objects,
					'46': '1',
					'47': '2',
				}]);

				levelsList.push(levelString);
			}

			levelsMultiString = levelsMultiString.slice(0, -1);

			let hash = await GJCrypto.genMulti(levelsMultiString);
			if (!hash) {
				fc.success(`Получение уровней не выполнено: hash пустой`);
				return '-1';
			}

			const result = `${levelsList.join('|')}#${usersList.join('|')}#${songsList.join('~:~')}#${levelsCount}:${page * 10}:10#${hash}`;

			fc.success(`Получение уровней выполнено`);
			return result;
		}
	});

	router.post(`/${config.basePath}/uploadGJLevel21.php`, async (req: any, res: any) => {
		const requredKeys = ['accountID', 'levelName', 'levelDesc', 'audioTrack', 'gjp'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const gjp = body.gjp || 0;
		const accountID = body.accountID;
		const ip = req.ip;

		let levelID = body.levelID;
		const levelName = body.levelName;
		const levelDesc = body.levelDesc;
		const levelLength = body.levelLength;
		const levelVersion = body.levelVersion;
		const audioTrack = body.audioTrack;
		const levelString = body.levelString;

		const auto = body.auto || 0;
		const password = body.password || 1;
		const original = body.original || 0;
		const twoPlayer = body.twoPlayer || 0;
		const songID = body.songID || 0;
		const objects = body.objects || 0;
		const coins = body.coins || 0;
		const requestedStars = body.requestedStars || 0;
		const extraString = body.extraString || '29_29_29_40_29_29_29_29_29_29_29_29_29_29_29_29';
		const unlisted = body.unlisted || 0;
		const ldm = body.ldm || 0;

		if (await GJCrypto.gjpCheck(gjp, accountID)) {
			if (!levelString || !levelName) {
				fc.error(`Уровень на аккаунте ${body.userName} не опубликован: имя или уровень пустой`);
				return '-1';
			}
			console.log('levelID: ' + levelID);

			if (levelID == 0) {
				levelID = (await LevelModel.countDocuments()) + 1;
			} else {
				let level = await LevelModel.findOne({ levelID: levelID });
				if (level && level.accountID != accountID) {
					fc.error(`Уровень на аккаунте ${body.userName} не опубликован: уровень ${levelID} уже есть от другого автора`);
					return '-1';
				}
			}

			await LevelModel.updateOne({ levelName: levelName, accountID: accountID }, {
				accountID: accountID,
				levelID: levelID,
				levelName: levelName,
				levelDesc: levelDesc,
				levelLength: levelLength,
				levelVersion: levelVersion,
				audioTrack: audioTrack,
				auto: auto,
				password: password,
				original: original,
				twoPlayer: twoPlayer,

				songID: songID,
				objects: objects,
				coins: coins,
				requestedStars: requestedStars,
				extraString: extraString,
				unlisted: unlisted,
				ldm: ldm,

				uploadDate: Math.round(Date.now() / 1000),
				updateDate: Math.round(Date.now() / 1000),

				IP: ip
			}, { upsert: true });

			try {
				await fs.writeAsync(`data/levels/${levelID}`, levelString);
			} catch (e) {
				fc.error(`Уровень на аккаунте ${body.userName} не опубликован: неизвестная ошибка\n${e.stack}`);
				return '-1';
			}

			axios.post(config.webhook, {
				"content": null,
				"embeds": [
					{
						"title": "Uploaded Level",
						"color": 3715756,
						"fields": [
							{
								"name": `${body.userName} uploaded a level ${levelID}`,
								"value": `Song: ${songID}`
							}
						],
						"footer": {
							"text": "ZeroCore Webhook"
						},
						"timestamp": new Date().toISOString()
					}
				]
			});

			fc.success(`Уровень на аккаунте ${body.userName} опубликован`);
			return `${levelID}`;
		} else {
			fc.error(`Уровень на аккаунте ${body.userName} не опубликован: ошибка авторизации`);
			return '-1';
		}
	});
}

export { router };