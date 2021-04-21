import fc from 'fancy-console';
import fs from 'fs-jetpack';
import config from '../config';

import zlib from 'node-gzip';
import axios from 'axios';

import WebHelper from '../helpers/classes/WebHelper';
import GJCrypto from '../helpers/classes/GJCrypto';
import GJHelpers from '../helpers/classes/GJHelpers';
import XOR from '../helpers/classes/XOR';

import { LevelModel } from '../helpers/models/level';
import { DailyModel } from '../helpers/models/daily';
import { GauntletModel } from '../helpers/models/gauntlets';

async function router(router: any, options: any) {
	router.post(`/${config.basePath}/downloadGJLevel22.php`, async (req: any, res: any) => {
		const requredKeys = ['levelID'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const levelID = body.levelID;

		const level = await LevelModel.findOne({ levelID: levelID })

		if (!level) {
			fc.error(`Скачивание уровня ${levelID} не выполнено: уровень не найден в бд`);
			return '-1';
		}

		let levelString: any = '';
		try {
			levelString = await fs.readAsync(`data/levels/${levelID}`, 'utf8');
		} catch (e) {
			fc.error(e);
			fc.error(`Скачивание уровня ${levelID} не выполнено: ошибка скачивания`);
			return '-1';
		}

		if (!levelString) {
			fc.error(`Скачивание уровня ${levelID} не выполнено: файл уровня не найден`);
			return '-1';
		}

		await LevelModel.findOneAndUpdate({ levelID: levelID }, { downloads: level.downloads + 1 });

		let pass = level.password;
		// if(checkModPerms('freeCopy')) pass = 1
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
			'5': '1',
			'6': level.accountID,
			'8': '10',
			'9': level.starDifficulty,
			'10': level.downloads,
			'11': '1',
			'12': level.audioTrack,
			'13': '21',
			'14': level.likes,
			'15': level.levelLength,
			'17': level.starDemon,
			'18': level.starStars,
			'19': level.starFeatured,
			'25': level.starAuto,
			'27': xorPass,
			'28': '500',
			'29': '300',
			'30': level.original,
			'31': '1',
			'35': level.songID,
			'36': level.extraString,
			'37': level.coins,
			'38': level.starCoins,
			'39': level.requestedStars,
			'40': level.ldm,
			'42': level.starEpic,
			'43': level.starDemonDiff,
			'45': level.objects,
			'46': '1',
			'47': '2',
			'48': '1',
		}]);

		response += `#${GJCrypto.genSolo(levelString)}#`;

		let someString = [level.accountID,
		level.starStars,
		level.starDemon,
		level.levelID,
		level.starCoins,
		level.starFeatured, pass, 0
		].join(',');

		response += GJCrypto.genSolo2(someString) + '#';
		response += someString;

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

		fc.success('Получение ежедневных уровней выполнено');
		console.log(`${dailyID}|${timeleft}`);
		return `${dailyID}|${timeleft}`;
	});

	router.post(`/${config.basePath}/getGJLevels21.php`, async (req: any, res: any) => {
		const body = req.body;

		const page = body.page;

		let levelsList = [];
		let levelsMultiString = '';
		let usersList = [];
		let songsList = [];

		let params: any = {};
		let orderBy: any = {};

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
			orderBy = { downloads: 1 };
		}
		else if (body.type == 2) {
			orderBy = { likes: -1 };
		}
		else if (body.type == 3) {
			orderBy = { uploadDate: { $lt: Date.now() - (7 * 24 * 60 * 60) } };
		}
		else if (body.type == 4) {
			orderBy = { levelID: -1 };
		}
		else if (body.type == 5) {
			params.accountID = body.str;
			orderBy = { levelID: -1 };
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
			params.levelLength = { $in: body.len.split(',') };
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

		console.log(params);

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
					'8': '10',
					'9': level.starDifficulty,
					'10': level.downloads,
					'12': level.audioTrack,
					'13': '21',
					'14': level.likes,
					'15': level.levelLength,
					'17': level.starDemon,
					'18': level.starStars,
					'19': level.starFeatured,
					'25': level.starAuto,
					'30': level.original,
					'31': '0',
					'35': level.songID,
					'37': level.coins,
					'38': level.starCoins,
					'39': level.requestedStars,
					'40': level.ldm,
					'42': level.starEpic,
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
			console.log(result);

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

		if (GJCrypto.gjpCheck(gjp, accountID)) {
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