import fc from 'fancy-console';

import bcrypt from 'bcrypt';
import express from 'express';

import Mongoose from '../helpers/classes/Mongoose';
import Express from '../helpers/classes/Express';

import GJCrypto from '../helpers/classes/GJCrypto';
import GJHelpers from '../helpers/classes/GJHelpers';
import config from '../config';

const router = express.Router();

router.post(`/${config.basePath}/rateGJStars(.php)?`, async (req, res) => {
	const requredKeys = ['accountID', 'gjp', 'secret'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	const gjp = body.gjp;
	const levelID = body.levelID;
	const accountID = body.accountID;
	const stars = body.stars;

	if (GJCrypto.gjpCheck(gjp, accountID)) {
		const permission = await GJHelpers.checkPermission(accountID, 'rateLevelStar');
		if (permission) {
			let diff: any = GJHelpers.getDiffFromStars(stars);
			await GJHelpers.rateLevel(accountID, levelID, 0, diff['diff'], diff['auto'], diff['demon']);
			fc.success(`Рейт уровня ${levelID} с аккаунта ${accountID} выполнен`);
			return res.send('1');
		}
		else {
			fc.error(`Рейт уровня ${levelID} с аккаунта ${accountID} не выполнен: нет прав`);
			return res.send('-1');
		}
	} else {
		fc.error(`Рейт уровня ${levelID} с аккаунта ${accountID} не выполнен: ошибка авторизации`);
		return res.send('-1');
	}
});

router.post(`/${config.basePath}/suggestGJStars(20)?(.php)?`, async (req, res) => {
	const requredKeys = ['secret', 'gjp', 'levelID', 'accountID'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-2');
	}

	const gjp = body.gjp;
	const levelID = body.levelID;
	const accountID = body.accountID;
	const stars = body.stars;
	const feature = body.feature;

	if (GJCrypto.gjpCheck(gjp, accountID)) {
		if (await GJHelpers.checkPermission(accountID, 'rateLevelStar')) {
			let diff: any = GJHelpers.getDiffFromStars(stars);
            console.log(diff);

			await GJHelpers.rateLevel(accountID, levelID, stars, diff['diff'], diff['auto'], diff['demon']);
			await GJHelpers.featureLevel(accountID, levelID, feature);
			await GJHelpers.verifyCoinsLevel(accountID, levelID, 1);

			fc.success(`Рейт уровня ${levelID} с аккаунта ${accountID} выполнен`);
			return res.send('1');
		}
		else if (await GJHelpers.checkPermission(accountID, 'sendLevelRate')) {
			fc.success(`Рейт уровня ${levelID} с аккаунта ${accountID} не выполнен: предложения рейтов не реализованны`);
			return res.send('1');
		}
		else {
			fc.error(`Рейт уровня ${levelID} с аккаунта ${accountID} не выполнен: нет прав`);
			return res.send('-2');
		}
	} else {
		fc.error(`Рейт уровня ${levelID} с аккаунта ${accountID} не выполнен: ошибка авторизации`);
		return res.send('-2');
	}
});

export { router };