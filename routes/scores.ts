import fc from 'fancy-console';
import config from '../config';

import bcrypt from 'bcrypt';

import WebHelper from '../helpers/classes/WebHelper';
import GJCrypto from '../helpers/classes/GJCrypto';
import GJHelpers from '../helpers/classes/GJHelpers';
import { FriendModel } from '../helpers/models/friend';
import { IUser, UserModel } from '../helpers/models/user';

async function router(router: any, options: any) {
	router.all(`/${config.basePath}/getGJScores20.php`, async (req: any, res: any) => {
		const requredKeys = ['secret', 'accountID', 'gjp', 'type'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		let accountID = body.accountID;
		const gjp = body.gjp;
		const type = body.type;

		if (accountID) {
			if (!await GJCrypto.gjpCheck(gjp, accountID)) {
				fc.error(`Получение топа игроков не удалось: ошибка авторизации`);
				return '-1';
			}
		}
		else {
			accountID = body.udid;
			if (!isNaN(accountID)) {
				return '-1';
			}
		}

		if (type == 'friends') {
			const friends = await FriendModel.find({
				$or: [
					{ accountID1: accountID },
					{ accountID2: accountID },
				]
			});

			let friendsIDs = [];
			friendsIDs.push(accountID);

			for (let friend of friends) {
				let accID = friend.accountID2 == accountID ? friend.accountID1 : friend.accountID2;
				friendsIDs.push(accID);
			}

			const users = await UserModel.find({
				accountID: { $in: friendsIDs }
			}).sort({ stars: -1 });

			let result = [];

			let i = 0;
			for (let user of users) {
				i++;

				result.push(`1:${user.userName}:2:${user.accountID}:13:${user.coins}:17:${user.userCoins}:6:${i}:9:${user.icon}:10:${user.color1}:11:${user.color2}:14:${user.iconType}:15:${user.special}:16:${user.accountID}:3:${user.stars}:8:${Math.floor(user.creatorPoints)}:4:${user.demons}:7:${user.accountID}:46:${user.diamonds}`);
			}

			if (!result.length) {
				fc.error(`Получение топа игроков не удалось: нет результата`);
				return '-1';
			}

			console.log(result);
			fc.success(`Получение топа игроков удалось`);
			return result.join('|');
		}
		else {
			if (type == 'top') {
				var users = await UserModel.find({
					isBanned: false,
					stars: { $gt: 0 }
				}).sort({ stars: -1 }).limit(100);
			}
			else if (type == 'creators') {
				var users = await UserModel.find({
					isBanned: false
				}).sort({ creatorPoints: -1 }).limit(100);
			}
			else if (type == 'relative') {
				var user = await UserModel.findOne({
					accountID: accountID
				});
				let stars = user.stars;

				if (body.count) var count = Math.floor(parseInt(body.count) / 2);
				else var count = Math.floor(25);

				// MongoDB Union :joy: :overdrive_ebalo:
				let users1 = await UserModel.find(
					{
						stars: { $lte: stars },
						isBanned: false
					}
				).sort({ stars: -1 });

				let users2 = await UserModel.find(
					{
						stars: { $gte: stars },
						isBanned: false
					}
				).sort({ stars: 1 });

				var users = users1;
				for (let user of users2) {
					users.push(user);
				}

				let compare = (a: IUser, b: IUser) => {
					if (a.stars > b.stars) return -1;
					if (a.stars < b.stars) return 1;
					return 0;
				}

				users = users.sort(compare);

				// удалить дубликаты
				users = users.reduce((unique, o) => {
					if (!unique.some((obj: IUser) => obj.accountID == o.accountID)) {
						unique.push(o);
					}
					return unique;
				}, []);

				console.log(users);
			}

			let result = [];

			let i = 0;
			for (let user of users) {
				i++;

				result.push(`1:${user.userName}:2:${user.accountID}:13:${user.coins}:17:${user.userCoins}:6:${i}:9:${user.icon}:10:${user.color1}:11:${user.color2}:14:${user.iconType}:15:${user.special}:16:${user.accountID}:3:${user.stars}:8:${Math.floor(user.creatorPoints)}:4:${user.demons}:7:${user.accountID}:46:${user.diamonds}`);
			}

			if (!result.length) {
				fc.error(`Получение топа игроков не удалось: нет результата`);
				return '-1';
			}

			console.log(result);
			fc.success(`Получение топа игроков удалось`);
			return result.join('|');
		}
	});
}

export { router };