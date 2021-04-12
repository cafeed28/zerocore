import fc from 'fancy-console';

import bcrypt from 'bcrypt';

import Mongoose from '../helpers/classes/Mongoose';
import WebHelper from '../helpers/classes/WebHelper';

import GJCrypto from '../helpers/classes/GJCrypto';
import GJHelpers from '../helpers/classes/GJHelpers';
import config from '../config';

async function router(router: any, options: any) {
	router.post(`/${config.basePath}/rateGJStars.php`, async (req: any, res: any) => {
		const requredKeys = ['accountID', 'gjp', 'secret'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

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
				return '1';
			}
			else {
				fc.error(`Рейт уровня ${levelID} с аккаунта ${accountID} не выполнен: нет прав`);
				return '-1';
			}
		} else {
			fc.error(`Рейт уровня ${levelID} с аккаунта ${accountID} не выполнен: ошибка авторизации`);
			return '-1';
		}
	});

	router.post(`/${config.basePath}/suggestGJStars20.php`, async (req: any, res: any) => {
		const requredKeys = ['secret', 'gjp', 'levelID', 'accountID'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const gjp = body.gjp;
		const levelID = body.levelID;
		const accountID = body.accountID;
		const stars = body.stars;
		const feature = body.feature;

		if (GJCrypto.gjpCheck(gjp, accountID)) {
			if (await GJHelpers.checkPermission(accountID, 'rateLevelStar')) {
				let diff: any = GJHelpers.getDiffFromStars(stars);

				await GJHelpers.rateLevel(accountID, levelID, stars, diff['diff'], diff['auto'], diff['demon']);
				await GJHelpers.featureLevel(accountID, levelID, feature);
				await GJHelpers.verifyCoinsLevel(accountID, levelID, 1);

				fc.success(`Рейт уровня ${levelID} с аккаунта ${accountID} выполнен`);
				return '1';
			}
			else if (await GJHelpers.checkPermission(accountID, 'sendLevelRate')) {
				fc.success(`Рейт уровня ${levelID} с аккаунта ${accountID} не выполнен: предложения рейтов не реализованны`);
				return '1';
			}
			else {
				fc.error(`Рейт уровня ${levelID} с аккаунта ${accountID} не выполнен: нет прав`);
				return '-2';
			}
		} else {
			fc.error(`Рейт уровня ${levelID} с аккаунта ${accountID} не выполнен: ошибка авторизации`);
			return '-2';
		}
	});
}

export { router };