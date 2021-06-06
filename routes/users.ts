import tinyhttp from '@opengalaxium/tinyhttp'

import fc from 'fancy-console';
import config from '../config';

import axios from 'axios';

import WebHelper from '../helpers/classes/WebHelper';
import GJCrypto from '../helpers/classes/GJCrypto';
import GJHelpers from '../helpers/classes/GJHelpers';

import { BlockModel } from '../helpers/models/block';
import { UserModel } from '../helpers/models/user';
import { FriendRequestModel } from '../helpers/models/friendRequest';
import { FriendModel } from '../helpers/models/friend';
import { MessageModel } from '../helpers/models/message';
import { AccountModel } from '../helpers/models/account';
import EPermissions from '../helpers/EPermissions';
import { ActionModel, IAction } from '../helpers/models/actions';
import EActions from '../helpers/EActions';

function routes(app: tinyhttp) {
	app.all(`/${config.basePath}/getGJUserInfo20`, async (req: any, res: any) => {
		const requredKeys = ['targetAccountID'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const gjp = body.gjp;
		const targetAccountID = body.targetAccountID;
		const accountID = body.accountID;

		if (accountID != 0 && gjp) {
			if (!await GJCrypto.gjpCheck(gjp, accountID)) {
				fc.error(`Получение статистики пользователя ${body.targetAccountID} не выполнено: неверный gjp`);
				return res.send('-1')
			}
		}

		const blocked = await BlockModel.findOne({ accountID1: targetAccountID, accountID2: accountID });

		if (blocked) {
			fc.error(`Получение статистики пользователя ${body.targetAccountID} не выполнено: пользователь заблокировал вас`);
			return res.send('-1')
		}

		const user = await UserModel.findOne({ accountID: body.targetAccountID });

		if (!user) {
			fc.error(`Получение статистики пользователя ${body.targetAccountID} не выполнено: пользователь не найден`);
			return res.send('-1')
		}

		let badge = GJHelpers.getAccountPermission(accountID, EPermissions.badgeLevel);
		let reqsState = user.frS;
		let msgState = user.mS;
		let commentState = user.cS;

		let appendix;

		let friendState = 0;

		if (accountID == targetAccountID) {
			let newFriendRequests = await FriendRequestModel.countDocuments({ toAccountID: accountID });
			let newMessages = await MessageModel.countDocuments({ recipientID: accountID, isUnread: true });
			let newFriends = await FriendModel.countDocuments({
				$or: [
					{ accountID1: accountID, isUnread2: true },
					{ accountID2: accountID, isUnread1: true }
				]
			});

			appendix = ':' + GJHelpers.jsonToRobtop([{
				'38': newMessages,
				'39': newFriendRequests,
				'40': newFriends
			}]);
		}
		else {
			let incomingRequests = await FriendRequestModel.findOne({
				fromAccountID: targetAccountID, toAccountID: accountID
			});
			if (incomingRequests) {
				friendState = 3;
				appendix = ':' + GJHelpers.jsonToRobtop([{
					'32': incomingRequests.requestID,
					'35': incomingRequests.message,
					'37': incomingRequests.uploadDate
				}]);
			}

			let outcomingRequests = await FriendRequestModel.countDocuments({
				toAccountID: targetAccountID, fromAccountID: accountID
			});
			if (outcomingRequests > 0) friendState = 4;

			let friend = await FriendModel.countDocuments({
				$or: [
					{ accountID1: accountID, accountID2: targetAccountID },
					{ accountID2: accountID, accountID1: targetAccountID }
				]
			});
			if (friend > 0) friendState = 1;
		}

		let rank = await UserModel.countDocuments({ stars: { $gt: user.stars }, isBanned: false });

		fc.success(`Получение статистики пользователя ${body.targetAccountID} выполнено`);

		return res.send(GJHelpers.jsonToRobtop([{
			'1': user.userName,
			'2': targetAccountID,
			'3': user.stars,
			'4': user.demons,
			'8': user.isBanned ? 0 : user.creatorPoints,
			'10': user.color1,
			'11': user.color2,
			'13': user.coins,
			'16': targetAccountID,
			'17': user.userCoins,
			'18': msgState,
			'19': reqsState,
			'20': user.youtube || '',
			'21': user.accIcon,
			'22': user.accShip,
			'23': user.accBall,
			'24': user.accBird,
			'25': user.accDart,
			'26': user.accRobot,
			'28': user.accGlow,
			'29': '1', // спасибо кволтон за комментирование кода, че это такое
			'30': user.isBanned ? 0 : rank + 1,
			'31': friendState,
			'43': user.accSpider,
			'44': user.twitter || '',
			'45': '', // twitch, когда выйдет blackTea от партура, удалю
			'46': user.diamonds,
			'47': user.accExplosion,
			'49': badge,
			'50': commentState
		}]) + appendix);
	});

	app.all(`/${config.basePath}/getGJUsers20`, async (req: any, res: any) => {
		const requredKeys = ['page', 'str'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const page = body.page;

		let usersList: string[] = [];

		const users = await UserModel.find({ userName: new RegExp(body.str, 'i') });

		if (!users.length) {
			fc.error(`Получение пользователей не выполнено: пользователи не найдены`);
			return res.send('-1')
		} else {
			users.map(user => {
				usersList.push(GJHelpers.jsonToRobtop([{
					'1': user.userName,
					'2': user.accountID,
					'3': user.stars,
					'4': user.demons,
					'8': user.creatorPoints,
					'9': user.accIcon,
					'10': user.color1,
					'11': user.color2,
					'13': user.coins,
					'14': user.iconType,
					'15': user.special,
					'16': user.accountID,
					'17': user.userCoins
				}]));
			});
		}
		fc.success(`Получение пользователей выполнено`);

		return res.send(usersList.join('|') + `#${users.length}:${page}:10`);
	});

	app.all(`/${config.basePath}/updateGJUserScore22`, async (req: any, res: any) => {
		const requredKeys = ['secret', 'userName', 'stars', 'demons', 'icon', 'color1', 'color2', 'gjp'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const userName = body.userName.replace(/[^A-Za-z0-9 ]/, '');
		const stars = body.stars;
		const demons = body.demons;
		const icon = body.icon;
		const color1 = body.color1;
		const color2 = body.color2;

		const coins = body.coins || 0;
		const userCoins = body.userCoins || 0;
		const diamonds = body.diamonds || 0;
		const special = body.special || 0;

		const iconType = body.iconType || 0;
		const accIcon = body.accIcon || 0;
		const accShip = body.accShip || 0;
		const accBall = body.accBall || 0;
		const accBird = body.accBird || 0;
		const accDart = body.accDart || 0;
		const accRobot = body.accRobot || 0;
		const accSpider = body.accSpider || 0;
		const accGlow = body.accGlow || 0;
		const accExplosion = body.accExplosion || 0;

		if (!body.udid && !body.accountID) {
			fc.error(`Обновление статистики пользователя ${body.userName} не выполнено: udid и accountID отсутствуют`);
			return res.send('-1')
		}

		if (body.udid) {
			if (!isNaN(body.udid)) {
				fc.error(`Обновление статистики пользователя ${body.userName} не выполнено: udid числовой`);
				return res.send('-1')
			}
		}

		const id = body.accountID;

		if (!await AccountModel.findOne({ accountID: id })) {
			fc.success(`Обновление статистики пользователя ${body.userName} не выполнено: аккаунта не существует`);
			return res.send('-1')
		}

		if (!await GJCrypto.gjpCheck(body.gjp, id)) {
			fc.error(`Обновление статистики пользователя ${body.userName} не выполнено: неверный gjp`);
			return res.send('-1')
		}

		const ip = req.ip;

		await UserModel.updateOne({ accountID: id }, {
			userName: userName,
			coins: coins,
			userCoins: userCoins,
			stars: stars,
			diamonds: diamonds,
			special: special,
			demons: demons,

			color1: color1,
			color2: color2,
			icon: icon,
			iconType: iconType,

			accIcon: accIcon,
			accShip: accShip,
			accBall: accBall,
			accBird: accBird,
			accDart: accDart,
			accRobot: accRobot,
			accSpider: accSpider,
			accGlow: accGlow,
			accExplosion: accExplosion,

			IP: ip,
			lastPlayed: Math.round(new Date().getTime() / 1000)
		}, { upsert: true, setDefaultsOnInsert: true });

		axios.post(config.webhook, {
			"content": null,
			"embeds": [
				{
					"title": "Updated Stats",
					"color": 3715756,
					"fields": [
						{
							"name": `${body.userName} updated a stats`,
							"value": `${stars} stars | ${diamonds} diamonds | ${coins} coins | ${userCoins} user coins | ${demons} demons`
						}
					],
					"footer": {
						"text": "ZeroCore Webhook"
					},
					"timestamp": new Date().toISOString()
				}
			]
		});

		const action: IAction = {
			actionType: EActions.itemLike,
			IP: req.ip,
			timestamp: Date.now()
		}
		await ActionModel.create(action);

		fc.success(`Обновление статистики пользователя ${body.userName} выполнено`);
		return res.send(id);
	});

	app.all(`/${config.basePath}/getGJScores`, async (req: any, res: any) => {
		const requredKeys = ['secret', 'gjp', 'accountID', 'type'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const gjp = body.gjp;
		const accountID = body.accountID;
		const type = body.type;
		let count = body.count || 50;

		if (await GJCrypto.gjpCheck(gjp, accountID)) {
			if (type == 'top' || type == 'creators' || type == 'relative') {
				let sort = {};
				let query: any = { isBanned: 0 };
				let limit = 100;

				if (type == 'top') sort = { stars: -1 };
				if (type == 'creators') sort = { creatorPoints: -1 };
				if (type == 'relative') {
					query = { isBanned: 0, accountID: accountID };
					let user = await UserModel.findOne(query);
					let stars = user.stars;
					count = Math.floor(count / 2);

					query = {
						stars: {
							$lte: stars
						},
						isBanned: 0
					};

					sort = { stars: -1 };
					limit = count;
				}

				let users = await UserModel.find(query).sort(sort).limit(limit);
			}

			fc.success(`Получение топа игроков пользователем ${accountID} выполнено`);
			return res.send('1')
		} else {
			fc.error(`Получение топа игроков пользователем ${accountID} не выполнено: ошибка авторизации`);
			return res.send('-1')
		}
	});
}

export { routes }