import fc from 'fancy-console';
import config from '../config';

import bcrypt from 'bcrypt';
import axios from 'axios';

import Mongoose from '../helpers/classes/Mongoose';
import WebHelper from '../helpers/classes/WebHelper';

import GJCrypto from '../helpers/classes/GJCrypto';
import GJHelpers from '../helpers/classes/GJHelpers';

async function router(router: any, options: any) {
	router.post(`/${config.basePath}/getGJUserInfo20.php`, async (req: any, res: any) => {
		const requredKeys = ['targetAccountID'];
		const body = req.body;
		if (!WebHelper.checkKeys(body, requredKeys)) {
			fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
			return res.code(400).send('-1');
		}

		const gjp = body.gjp;
		const targetAccountID = body.targetAccountID;
		const accountID = body.accountID;

		if (accountID != 0 && gjp) {
			if (!GJCrypto.gjpCheck(gjp, accountID)) {
				fc.error(`Получение статистики пользователя ${body.targetAccountID} не выполнено: неверный gjp`);
				return '-1';
			}
		}

		const blocked = await Mongoose.blocks.findOne({ accountID1: targetAccountID, accountID2: accountID });

		if (blocked) {
			fc.error(`Получение статистики пользователя ${body.targetAccountID} не выполнено: пользователь заблокировал вас`);
			return '-1';
		}

		const user = await Mongoose.users.findOne({ accountID: body.targetAccountID });

		if (!user) {
			fc.error(`Получение статистики пользователя ${body.targetAccountID} не выполнено: пользователь не найден`);
			return '-1';
		}

		// badge
		// reqState, msgState, commentState (че)

		let appendix;

		let friendState = 0;

		if (accountID == targetAccountID) {
			let newFriendRequests = await Mongoose.friendrequests.countDocuments({ toAccountID: accountID });
			// let newMessages = await Mongoose.messages.countDocuments({ toAccountID: accountID, isUnread: 1 });
			let newMessages = 2;
			let newFriends = await Mongoose.friends.countDocuments({
				$or: [
					{ accountID1: accountID, isUnread2: 1 },
					{ accountID2: accountID, isUnread1: 1 }]
			});

			appendix = ':' + GJHelpers.jsonToRobtop([{
				'38': newMessages,
				'39': newFriendRequests,
				'40': newFriends
			}]);
		}
		else {
			let incomingRequests: any = await Mongoose.friendrequests.find({
				fromAccountID: targetAccountID, toAccountID: accountID
			});
			if (incomingRequests.length > 0) {
				friendState = 3;
				appendix = ':' + GJHelpers.jsonToRobtop([{
					'32': incomingRequests.requestID,
					'35': incomingRequests.message,
					'37': 'send this to cafeed28: кафiф#5693'
				}]);
			}

			let outcomingRequests = await Mongoose.friendrequests.countDocuments({
				toAccountID: targetAccountID, fromAccountID: accountID
			});
			if (outcomingRequests > 0) friendState = 4;

			let friend = await Mongoose.friends.countDocuments({
				$or: [
					{ accountID1: accountID, accountID2: targetAccountID },
					{ accountID2: accountID, accountID1: targetAccountID }
				]
			});
			if (friend > 0) friendState = 1;
		}

		fc.success(`Получение статистики пользователя ${body.targetAccountID} выполнено`);

		return res.send(GJHelpers.jsonToRobtop([{
			'1': user.userName,
			'2': targetAccountID,
			'3': user.stars,
			'4': user.demons,
			'8': user.creatorPoints,
			'10': user.color1,
			'11': user.color2,
			'13': user.coins,
			'16': targetAccountID,
			'17': user.userCoins,
			'18': '0', // msgState
			'19': '0', // reqsState
			'20': user.youtube || '',
			'21': user.accIcon,
			'22': user.accShip,
			'23': user.accBall,
			'24': user.accBird,
			'25': user.accDart,
			'26': user.accRobot,
			'28': user.accGlow,
			'29': '1', // спасибо кволтон за комментирование кода, че это такое
			'30': user.stars + 1,
			'31': '1', // friendReqState
			'43': user.accSpider,
			'44': user.twitter || '',
			'45': '', // twitch, когда выйдет blackTea от партура, удалю
			'46': user.diamonds,
			'47': user.accExplosion,
			'49': user.badge,
			'50': '0' // commentState
		}]) + appendix);
	});

	router.post(`/${config.basePath}/getGJUsers20.php`, async (req: any, res: any) => {
		const requredKeys = ['page', 'str'];
		const body = req.body;
		if (!WebHelper.checkKeys(body, requredKeys)) {
			fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
			return res.code(400).send('-1');
		}

		const page = body.page;

		let usersString = '';

		const users = await Mongoose.users.find({ userName: new RegExp(body.str, 'i') });

		if (!users.length) {
			fc.error(`Получение пользователей не выполнено: пользователи не найдены`);
			return '-1';
		} else {
			users.map(user => {
				usersString += GJHelpers.jsonToRobtop([{
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
				}]) + '|';
			});
		}
		fc.success(`Получение пользователей выполнено`);

		return usersString.slice(0, -1) + `#${users.length}:${page}:10`;
	});

	router.post(`/${config.basePath}/updateGJUserScore22.php`, async (req: any, res: any) => {
		const requredKeys = ['secret', 'userName', 'stars', 'demons', 'icon', 'color1', 'color2', 'gjp'];
		const body = req.body;
		if (!WebHelper.checkKeys(body, requredKeys)) {
			fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
			return res.code(400).send('-1');
		}

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
			return '-1';
		}

		if (body.udid) {
			if (!isNaN(body.udid)) {
				fc.error(`Обновление статистики пользователя ${body.userName} не выполнено: udid числовой`);
				return '-1';
			}
		}

		const id = body.accountID;

		if (!await Mongoose.accounts.findOne({ accountID: id })) {
			fc.success(`Обновление статистики пользователя ${body.userName} не выполнено: аккаунта не существует`);
			return '-1';
		}

		if (!GJCrypto.gjpCheck(body.gjp, id)) {
			fc.error(`Обновление статистики пользователя ${body.userName} не выполнено: неверный gjp`);
			return '-1';
		}

		const ip = req.ip;

		await Mongoose.users.updateOne({ accountID: id }, {
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
			lastPlayed: Math.round(new Date().getTime() / 1000),
		}, { upsert: true });

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

		fc.success(`Обновление статистики пользователя ${body.userName} выполнено`);
		return id;
	});

	router.post(`/${config.basePath}/getGJScores.php`, async (req: any, res: any) => {
		const requredKeys = ['secret', 'gjp', 'accountID', 'type'];
		const body = req.body;
		if (!WebHelper.checkKeys(body, requredKeys)) {
			fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
			return res.code(400).send('-1');
		}

		const gjp = body.gjp;
		const accountID = body.accountID;
		const type = body.type;
		let count = body.count || 50;

		if (GJCrypto.gjpCheck(gjp, accountID)) {
			if (type == 'top' || type == 'creators' || type == 'relative') {
				let sort = {};
				let query: any = { isBanned: 0 };
				let limit = 100;

				if (type == 'top') sort = { stars: -1 };
				if (type == 'creators') sort = { creatorPoints: -1 };
				if (type == 'relative') {
					query = { isBanned: 0, accountID: accountID };
					let user: any = await Mongoose.users.find(query);
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

				let users = await Mongoose.users.find(query).sort(sort).limit(limit);
			}

			fc.success(`Получение топа игроков пользователем ${accountID} выполнено`);
			return '1';
		} else {
			fc.error(`Получение топа игроков пользователем ${accountID} не выполнено: ошибка авторизации`);
			return '-1';
		}
	});
}

export { router };