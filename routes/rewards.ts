import fc from 'fancy-console';
import config from '../config';
import drc from '../dailyRewardsConfig';

import WebHelper from '../helpers/classes/WebHelper';
import GJCrypto from '../helpers/classes/GJCrypto';
import GJHelpers from '../helpers/classes/GJHelpers';

import { UserModel } from '../helpers/models/user';
import XOR from '../helpers/classes/xor';
import { randomInt } from 'crypto';

async function router(router: any, options: any) {
	router.post(`/${config.basePath}/getGJRewards.php`, async (req: any, res: any) => {
		const requredKeys = ['secret', 'chk', 'gjp'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const accountID = body.accountID;
		if (accountID == 0) {
			fc.error(`Получение ежедневных наград не выполнено: пользователь не зарегестрирован`);
			return '-1';
		}

		const udid = body.udid;
		let chk: string = body.chk;
		const gjp = body.gjp;
		const rewardType = body.rewardType;

		if (GJCrypto.gjpCheck(gjp, accountID)) {
			const user = await UserModel.findOne({ accountID: accountID });
			if (!user) {
				fc.error(`Получение ежедневных наград для ${accountID} не выполнено: пользователь не зарегестрирован`);
				return '-1';
			}

			chk = XOR.cipher(Buffer.from(chk.substring(5), 'base64').toString(), 59182);

			let time = Math.round(Date.now() / 1000) + 100;

			let chest1Time = user.chest1Time;
			let chest1Count = user.chest1Count;
			let chest2Time = user.chest2Time;
			let chest2Count = user.chest2Count;

			let chest1Diff = time - chest1Time;
			let chest2Diff = time - chest2Time;

			let chest1Left = Math.max(0, drc.c1Timeout - chest1Diff);
			let chest2Left = Math.max(0, drc.c2Timeout - chest2Diff);

			let userQuery = await UserModel.find({ accountID: accountID });

			if (rewardType == 1) {
				if (chest1Left != 0) {
					fc.error(`Получение ежедневных наград для ${accountID} не выполнено: нет награды 1`);
					return '-1';
				}
				chest1Count++;
				await userQuery[0].updateOne({ chest1Count: chest1Count, chest1Time: time });
			}
			else if (rewardType == 2) {
				if (chest2Left != 0) {
					fc.error(`Получение ежедневных наград для ${accountID} не выполнено: нет награды 2`);
					return '-1';
				}
				chest2Count++;
				await userQuery[0].updateOne({ chest2Count: chest2Count, chest2Time: time });
			}

			const r = randomInt;
			let chest1Content = `${r(drc.c1MinOrbs, drc.c1MaxOrbs)},${r(drc.c1MinDiamonds, drc.c1MaxDiamonds)},${r(drc.c1MinShards, drc.c1MaxShards)},${r(drc.c1MinKeys, drc.c1MaxKeys)}`;
			let chest2Content = `${r(drc.c2MinOrbs, drc.c2MaxOrbs)},${r(drc.c2MinDiamonds, drc.c2MaxDiamonds)},${r(drc.c2MInItemID, drc.c2MaxItemID)},${r(drc.c1MinKeys, drc.c1MaxKeys)}`;

			let str = `1:${accountID}:${chk}:${udid}:${accountID}:${chest1Left}:${chest1Content}:${chest1Count}:${chest2Left}:${chest2Content}:${chest2Count}:${rewardType}`;
			console.log(str);
			let xor = XOR.cipher(str, 59182);
			let result = Buffer.from(xor).toString('base64').replace('/', '_').replace('+', '-');

			let hash = GJCrypto.genSolo4(result);
			console.log(hash);

			fc.success(`Получение ежедневных наград ${rewardType} для ${accountID} выполнено`);
			return `SaKuJ${result}|${hash}`;
		}
		else {
			fc.error(`Получение ежедневных наград для ${accountID} не выполнено: ошибка авторизации`);
			return '-1';
		}
	});
}

export { router };