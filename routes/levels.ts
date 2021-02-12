import fc from 'fancy-console';
import fs from 'fs-jetpack';

import bcrypt from 'bcrypt';
import express from 'express';
import zlib from 'node-gzip';

import Mongoose from '../helpers/Mongoose';
import Express from '../helpers/Express';

import GJCrypto from '../helpers/GJCrypto';
import GJHelpers from '../helpers/GJHelpers';
import XOR from '../helpers/xor';

const router = express.Router();

router.post('/downloadGJLevel(22)?(.php)?', async (req, res) => {
	const requredKeys = ['levelID'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	const levelID = body.levelID;

	const level = await Mongoose.levels.findOne({ levelID: levelID })

	if (!level) {
		fc.error(`Скачивание уровня ${levelID} не выполнено: уровень не найден в бд`);
		return res.send('-1');
	}

	let levelString = '';
	try {
		levelString = (await fs.fileAsync(`data/levels/${levelID}`)).toString();
	} catch (e) {
		fc.error(e);
		fc.error(`Скачивание уровня ${levelID} не выполнено: файл уровня не найден`);
		return res.send('-1');
	}

	if (!levelString) {
		fc.error(`Скачивание уровня ${levelID} не выполнено: файл уровня не найден`);
		return res.send('-1');
	}

	await Mongoose.levels.findOneAndUpdate({ levelID: levelID }, { downloads: level.downloads + 1 });

	let pass = level.password;
	let xorPass = pass;
	// if(checkModPerms('freeCopy')) pass = 1
	if (pass != 0) {
		xorPass = Buffer.from(XOR.cipher(pass, 26364)).toString('base64');
	}

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
		'17': level.starDemon,
		'43': level.starDemonDiff,
		'25': level.starAuto,
		'18': level.starStars,
		'19': level.starFeatured,
		'42': level.starEpic,
		'45': level.objects,
		'15': level.levelLength,
		'30': level.original,
		'31': '1',
		'28': 'send this to cafeed28: кафiф#5693',
		'29': 'send this to cafeed28: кафiф#5693',
		'35': level.songID,
		'36': level.extraString,
		'37': level.coins,
		'38': level.starCoins,
		'39': level.requestedStars,
		'46': '1',
		'47': '2',
		'48': '1',
		'40': level.ldm,
		'27': xorPass,
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
	return res.send(response);
});

router.post('/getGJLevels(21)?(.php)?', async (req, res) => {
	const requredKeys = ['page', 'str'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	const page = body.page;

	let levelsString = '';
	let levelsMultiString = '';
	let usersString = '';
	let songsString = '';

	let params: any = {};

	if (!parseInt(body.str)) params.levelName = new RegExp(body.str, 'i');
	else params.levelID = body.str; // search by ID

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

	// gauntlet

	if (body.len && body.len != '-') {
		params.levelLength = { $in: body.len.split(',') };
	}

	console.log(params);

	const levels = await Mongoose.levels.find(params).skip(page * 10).limit(10);
	const levelsCount = await Mongoose.levels.countDocuments(params);

	if (!levels.length) {
		fc.error(`Получение уровней не выполнено: уровни не найдены`);
		return res.send('-1');
	} else {
		for (const level of levels) {
			if (level.unlisted == 1) continue;

			levelsMultiString += level.levelID + ',';

			if (level.songID != 0) {
				const song = await GJHelpers.getSongString(level.songID);
				if (song) songsString += song + '~:~';
			}

			const user = await GJHelpers.getUserString(level.accountID)
			usersString += user + '|';

			const levelString = GJHelpers.jsonToRobtop([{
				'1': level.levelID,
				'2': level.levelName,
				'3': level.levelDesc,
				'5': level.version || 0,
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
			}]) + '|';

			levelsString += levelString;
		}

		levelsString = levelsString.slice(0, -1);
		levelsMultiString = levelsMultiString.slice(0, -1);
		usersString = usersString.slice(0, -1);
		songsString = songsString.slice(0, -3);

		let hash = await GJCrypto.genMulti(levelsMultiString);
		if (!hash) {
			fc.success(`Получение уровней не выполнено: hash пустой`);
			return res.send('-1');
		}

		fc.success(`Получение уровней выполнено`);

		const result = `${levelsString}#${usersString}#${songsString}#${levelsCount}:${page * 10}:10#${hash}`;
		return res.send(result);
	}
});

router.post('/uploadGJLevel(21)?(.php)?', async (req, res) => {
	const requredKeys = ['accountID', 'levelName', 'levelDesc', 'audioTrack', 'gjp'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	const gjp = body.gjp || 0;
	const accountID = body.accountID;
	const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

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
			return res.send('-1');
		}
		console.log('levelID: ' + levelID);

		if (levelID == 0) {
			levelID = (await Mongoose.levels.countDocuments()) + 1;
		} else {
			let level = await Mongoose.levels.findOne({ levelID: levelID });
			if (level && level.accountID != accountID) {
				fc.error(`Уровень на аккаунте ${body.userName} не опубликован: уровень ${levelID} уже есть от другого автора`);
				return res.send('-1');
			}
		}

		await Mongoose.levels.updateOne({ levelName: levelName, accountID: accountID }, {
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
			return res.send('-1');
		}

		fc.success(`Уровень на аккаунте ${body.userName} опубликован`);
		return res.send(`${levelID}`);
	} else {
		fc.error(`Уровень на аккаунте ${body.userName} не опубликован: ошибка авторизации`);
		return res.send('-1');
	}
});

export { router };