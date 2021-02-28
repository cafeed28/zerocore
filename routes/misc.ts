import fc from 'fancy-console';
import fs from 'fs-jetpack';
import zlib from 'node-gzip';

import bcrypt from 'bcrypt';
import express from 'express';
import axios from 'axios';

import Mongoose from '../helpers/classes/Mongoose';
import Express from '../helpers/classes/Express';

import GJCrypto from '../helpers/classes/GJCrypto';
import GJHelpers from '../helpers/classes/GJHelpers';

const router = express.Router();

router.post('/getAccountURL(.php)?', async (req, res) => {
	const requredKeys: any[] = [];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	return res.send('http://' + req.headers.host + req.url);
});

router.post('/getAccountURL(.php)?/database/accounts/backupGJAccountNew(.php)?', async (req, res) => {
	const requredKeys = ['userName', 'password', 'saveData'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	let saveData = body.saveData
	const userName = body.userName;
	const password = body.password;
	const accountID = (await Mongoose.accounts.findOne({ userName: userName })).accountID;

	if (await GJHelpers.isValid(userName, password)) {
		let saveDataArr = saveData.split(';');
		let saveDataBuff = Buffer.from(saveDataArr[0].replace(/-/g, '+').replace(/_/g, '/'), 'base64');

		saveData = Buffer.from(await zlib.ungzip(saveDataBuff)).toString('ascii');

		let orbs = saveData.split('</s><k>14</k><s>')[1].split('</s>')[0];
		let levels = saveData.split('<k>GS_value</k>')[1].split('</s><k>4</k><s>')[1].split('</s>')[0];

		saveData = Buffer.from(await zlib.gzip(saveData)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
		saveData = saveData + ';' + saveDataArr[1];

		try {
			await fs.writeAsync(`data/saves/${accountID}`, saveData);
		}
		catch (e) {
			fc.error(`Сохрнение аккаунта ${userName} не выполнено: неизвестная ошибка\n${e.stack}`);
			return res.send('-1');
		}
		await Mongoose.users.updateOne({ accountID: accountID }, { orbs: orbs, completedLevels: levels });

		fc.success(`Сохрнение аккаунта ${userName} выполнено`);
		return res.send('1');
	}
	else {
		fc.success(`Сохрнение аккаунта ${userName} не выполнено: ошибка авторизации`);
		return res.send('-1');
	}
});

router.post('/getAccountURL.php/database/accounts/syncGJAccountNew.php', async (req, res) => {
	const requredKeys = ['userName', 'password'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	const userName = body.userName;
	const password = body.password;
	const accountID = (await Mongoose.accounts.findOne({ userName: userName })).accountID;

	if (await GJHelpers.isValid(userName, password)) {
		let saveData;
		try {
			saveData = await fs.readAsync(`data/saves/${accountID}`, 'utf8');
		}
		catch (e) {
			fc.error(`Восстановление аккаунта ${userName} не выполнено: `, e.stack);
			return '-1'
		}

		fc.success(`Восстановление аккаунта ${userName} выполнено`);
		return res.send(`${saveData};21;30;a;a`);
	}
	else {
		fc.success(`Восстановление аккаунта ${userName} не выполнено: ошибка авторизации`);
		return res.send('-1');
	}
});

router.post('/likeGJItem(211)?(.php)?', async (req, res) => {
	const requredKeys = ['gjp', 'accountID', 'itemID', 'like', 'type'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	const gjp = body.gjp;
	const accountID = body.accountID;
	const type = body.type;
	const itemID = body.itemID;

	if (GJCrypto.gjpCheck(gjp, accountID)) {
		let item;

		if (type == 1) {
			item = await Mongoose.levels.findOne({ levelID: itemID });
		} else if (type == 2) {
			item = await Mongoose.comments.findOne({ commentID: itemID });
		} else if (type == 3) {
			item = await Mongoose.posts.findOne({ postID: itemID });
		} else {
			fc.error(`Лайк на предмет типа ${type} с ID ${itemID} не поставлен: неизвестный тип`);
			return res.send('-1');
		}

		if (!item) {
			fc.error(`Лайк на предмет типа ${type} с ID ${itemID} не поставлен: предмет не найден`);
			return res.send('-1');
		}

		let likes = item.likes;
		if (body.like == 1) likes++;
		else likes--;

		await item.updateOne({ likes: likes });

		fc.success(`Лайк на предмет типа ${type} с ID ${itemID} поставлен`);
		return res.send('1');
	} else {
		fc.error(`Лайк на предмет типа ${type} с ID ${itemID} не поставлен: ошибка авторизации`);
		return res.send('-1');
	}
});

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

router.post('/requestUserAccess(.php)?', async (req, res) => {
	const requredKeys = ['accountID', 'gjp', 'secret'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	const accountID = body.accountID;
	const gjp = body.gjp;
	if (GJCrypto.gjpCheck(gjp, accountID)) {
		if (await GJHelpers.getAccountPermission(accountID, 'badgeLevel') > 0) {
			const permission = await GJHelpers.getAccountPermission(accountID, 'badgeLevel');

			fc.success(`Доступ модератора аккаунта ${accountID} уровня ${permission} получен`);
			return res.send(permission.toString());
		}
		else {
			fc.error(`Доступ модератора аккаунта ${accountID} не получен: доступ запрещен`);
			return res.send('-1');
		}
	}
	else {
		fc.error(`Доступ модератора аккаунта ${accountID} не получен: ошибка авторизации`);
		return res.send('-1');
	}
});

router.post('/suggestGJStars(20)?(.php)?', async (req, res) => {
	const requredKeys = ['accountID', 'gjp', 'secret'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	const accountID = body.accountID;
	const gjp = body.gjp;
	if (GJCrypto.gjpCheck(gjp, accountID)) {
		if (await GJHelpers.getAccountPermission(accountID, 'badgeLevel') > 0) {
			const permission = await GJHelpers.getAccountPermission(accountID, 'badgeLevel');

			fc.success(`Доступ модератора аккаунта ${accountID} уровня ${permission} получен`);
			return res.send(permission.toString());
		}
		else {
			fc.error(`Доступ модератора аккаунта ${accountID} не получен: доступ запрещен`);
			return res.send('-1');
		}
	}
	else {
		fc.error(`Доступ модератора аккаунта ${accountID} не получен: ошибка авторизации`);
		return res.send('-1');
	}
});

export { router };