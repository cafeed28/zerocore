import fc from 'fancy-console';

import bcrypt from 'bcrypt';
import express from 'express';

import Mongoose from '../helpers/Mongoose';
import Express from '../helpers/Express';

import GJCrypto from '../helpers/GJCrypto';
import GJHelpers from '../helpers/GJHelpers';

const router = express.Router();

router.post('/getGJUserInfo(20)?(.php)?', async (req, res) => {
	const requredKeys = ['targetAccountID'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	const gjp = body.gjp;
	const targetAccountID = body.targetAccountID;
	const accountID = body.accountID;

	if (accountID != 0 && gjp) {
		if (!GJCrypto.gjpCheck(gjp, accountID)) {
			fc.error(`Получение статистики пользователя ${body.targetAccountID} не выполнено: неверный gjp`);
			return res.send('-1');
		}
	}

	const blocked = await Mongoose.blocks.findOne({ accountID1: targetAccountID, accountID2: accountID });

	if (blocked) {
		fc.error(`Получение статистики пользователя ${body.targetAccountID} не выполнено: пользователь заблокировал вас`);
		return res.send('-1');
	}

	const user = await Mongoose.users.findOne({ accountID: body.targetAccountID });

	if (!user) {
		fc.error(`Получение статистики пользователя ${body.targetAccountID} не выполнено: пользователь не найден`);
		return res.send('-1');
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

router.post('/getGJUsers(20)?(.php)?', async (req, res) => {
	const requredKeys = ['page', 'str'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	const page = body.page;

	let usersString = '';

	const users = await Mongoose.users.find({ userName: new RegExp(body.str, 'i') });

	if (!users.length) {
		fc.error(`Получение пользователей не выполнено: пользователи не найдены`);
		return res.send('-1');
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

	return res.send(usersString.slice(0, -1) + `#${users.length}:${page}:10`);
});

router.post('/updateGJUserScore(22)?(.php)?', async (req, res) => {
	const requredKeys = ['secret', 'userName', 'stars', 'demons', 'icon', 'color1', 'color2', 'gjp'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
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
		return res.send('-1');
	}

	if (body.udid) {
		if (!isNaN(body.udid)) {
			fc.error(`Обновление статистики пользователя ${body.userName} не выполнено: udid числовой`);
			return res.send('-1');
		}
	}

	const id = body.accountID;

	if (!await Mongoose.accounts.findOne({ accountID: id })) {
		fc.success(`Обновление статистики пользователя ${body.userName} не выполнено: аккаунта не существует`);
		return res.send('-1');
	}

	if (!GJCrypto.gjpCheck(body.gjp, id)) {
		fc.error(`Обновление статистики пользователя ${body.userName} не выполнено: неверный gjp`);
		return res.send('-1');
	}

	const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

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
		lastPlayed: new Date().getTime(),
	}, { upsert: true });

	fc.success(`Обновление статистики пользователя ${body.userName} выполнено`);
	return res.send(id);
});

export { router };