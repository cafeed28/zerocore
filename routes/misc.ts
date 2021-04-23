import fc from 'fancy-console';
import fs from 'fs-jetpack';
import config from '../config';

import zlib from 'node-gzip';
import axios from 'axios';

import WebHelper from '../helpers/classes/WebHelper';
import GJCrypto from '../helpers/classes/GJCrypto';
import GJHelpers from '../helpers/classes/GJHelpers';

import { AccountModel } from '../helpers/models/account';
import { UserModel } from '../helpers/models/user';
import { LevelModel } from '../helpers/models/level';
import { CommentModel } from '../helpers/models/comment';
import { PostModel } from '../helpers/models/post';
import { SongModel } from '../helpers/models/song';
import EPermissions from '../helpers/EPermissions';

async function router(router: any, options: any) {
	router.post(`/${config.basePath}/getAccountURL.php`, async (req: any, res: any) => {
		const requredKeys: any[] = ['accountID', 'secret', 'type'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		return 'http://' + req.headers.host + req.url;
	});

	// idk why i should use this path, robtop why?
	router.post(`/${config.basePath}/getAccountURL.php/database/accounts/backupGJAccountNew.php`, async (req: any, res: any) => {
		const requredKeys = ['userName', 'password', 'saveData'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		let saveData = body.saveData
		const userName = body.userName;
		const password = body.password;
		const accountID = (await AccountModel.findOne({ userName: userName })).accountID;

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
				return '-1';
			}
			await UserModel.updateOne({ accountID: accountID }, { orbs: orbs, completedLevels: levels });

			fc.success(`Сохрнение аккаунта ${userName} выполнено`);
			return '1';
		}
		else {
			fc.success(`Сохрнение аккаунта ${userName} не выполнено: ошибка авторизации`);
			return '-1';
		}
	});

	// same as backup, robtop, why
	router.post(`/${config.basePath}/getAccountURL.php/database/accounts/syncGJAccountNew.php`, async (req: any, res: any) => {
		const requredKeys = ['userName', 'password'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const userName = body.userName;
		const password = body.password;
		const accountID = (await AccountModel.findOne({ userName: userName })).accountID;

		if (await GJHelpers.isValid(userName, password)) {
			let saveData;

			try {
				saveData = await fs.readAsync(`data/saves/${accountID}`, 'utf8');
			}
			catch (e) {
				fc.error(`Восстановление аккаунта ${userName} не выполнено: `, e.stack);
				return '-1'
			}

			if (!saveData) {
				fc.success(`Восстановление аккаунта ${userName} не выполнено: нет бэкапа`);
				return '-1';
			}

			fc.success(`Восстановление аккаунта ${userName} выполнено`);
			return `${saveData};21;30;a;a`;
		}
		else {
			fc.success(`Восстановление аккаунта ${userName} не выполнено: ошибка авторизации`);
			return '-1';
		}
	});

	router.post(`/${config.basePath}/likeGJItem([0-9]{2,3?)?.php`, async (req: any, res: any) => {
		const requredKeys = ['gjp', 'accountID', 'itemID', 'like', 'type'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const gjp = body.gjp;
		const accountID = body.accountID;
		const type = body.type;
		const itemID = body.itemID;

		if (await GJCrypto.gjpCheck(gjp, accountID)) {
			let item;

			if (type == 1) {
				item = await LevelModel.findOne({ levelID: itemID });
			} else if (type == 2) {
				item = await CommentModel.findOne({ commentID: itemID });
			} else if (type == 3) {
				item = await PostModel.findOne({ postID: itemID });
			} else {
				fc.error(`Лайк на предмет типа ${type} с ID ${itemID} не поставлен: неизвестный тип`);
				return '-1';
			}

			if (!item) {
				fc.error(`Лайк на предмет типа ${type} с ID ${itemID} не поставлен: предмет не найден`);
				return '-1';
			}

			let likes = item.likes;
			if (body.like == 1) likes++;
			else likes--;

			await item.updateOne({ likes: likes });

			fc.success(`Лайк на предмет типа ${type} с ID ${itemID} поставлен`);
			return '1';
		} else {
			fc.error(`Лайк на предмет типа ${type} с ID ${itemID} не поставлен: ошибка авторизации`);
			return '-1';
		}
	});

	router.post(`/${config.basePath}/getGJSongInfo.php`, async (req: any, res: any) => {
		const requredKeys = ['songID', 'secret'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const songID = body.songID;

		const song = await SongModel.findOne({ songID: songID });

		if (!song && songID > 5000000) {
			fc.error(`Получение информации музыки ${songID} не удалось: кастомная музыка не найдена`);
			return '-1';
		} else if (song) {
			let download = song.download;
			if (download.includes(':')) {
				download = encodeURIComponent(download);
			}

			let result = `1~|~${song.songID}~|~2~|~${song.name}~|~3~|~${song.authorID}~|~4~|~${song.authorName}~|~5~|~${song.size}~|~6~|~~|~10~|~${download}~|~7~|~~|~8~|~0`;

			fc.success(`Получение информации музыки ${songID} удалось`);
			return result;
		}

		let songString = '';

		let params = new URLSearchParams();
		params.append('songID', songID);
		params.append('secret', body.secret);

		const bRes = await axios.post('http://www.boomlings.com/database/getGJSongInfo.php', params);
		songString = bRes.data;

		if (bRes.data == '-2' || bRes.data == '-1' || bRes.data == '') {
			fc.error(`Получение информации музыки ${songID} не удалось: музыка не найдена`);
			return '-1';
		}

		fc.success(`Получение информации музыки ${songID} удалось`);
		return songString;
	});

	router.post(`/${config.basePath}/requestUserAccess.php`, async (req: any, res: any) => {
		const requredKeys = ['accountID', 'gjp', 'secret'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const accountID = body.accountID;
		const gjp = body.gjp;
		if (await GJCrypto.gjpCheck(gjp, accountID)) {
			if (await GJHelpers.getAccountPermission(accountID, EPermissions.badgeLevel) > 0) {
				const permission = await GJHelpers.getAccountPermission(accountID, EPermissions.badgeLevel);

				fc.success(`Доступ модератора аккаунта ${accountID} уровня ${permission} получен`);
				return permission.toString();
			}
			else {
				fc.error(`Доступ модератора аккаунта ${accountID} не получен: доступ запрещен`);
				return '-1';
			}
		}
		else {
			fc.error(`Доступ модератора аккаунта ${accountID} не получен: ошибка авторизации`);
			return '-1';
		}
	});
}

export { router };