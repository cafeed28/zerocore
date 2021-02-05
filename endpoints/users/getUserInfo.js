const fc = require('fancy-console');
const { check } = require('../../lib/gjp');
const { jsonToRobtop } = require('../../lib/utils');

module.exports = {
	path: 'getGJUserInfo20.php',
	aliases: ['getGJUserInfo20'],
	requiredKeys: ['targetAccountID'],
	async execute(req, res, body, server) {
		const gjp = body.gjp || 0;
		const targetAccountID = body.targetAccountID;
		const accountID = body.accountID;

		if (accountID == 0 || gjp != 0) {
			if (!check(gjp, accountID)) {
				fc.error(`Получение статистики пользователя ${body.targetAccountID} не выполнено: неверный gjp`);
				return res.send('-1');
			}
		}

		const blocked = await server.blocks.findOne({ accountID1: targetAccountID, accountID2: accountID });

		if (blocked) {
			fc.error(`Получение статистики пользователя ${body.targetAccountID} не выполнено: пользователь заблокировал вас`);
			return res.send('-1');
		}

		const user = await server.users.findOne({ accountID: body.targetAccountID });

		if (!user) {
			fc.error(`Получение статистики пользователя ${body.targetAccountID} не выполнено: пользователь не найден`);
			return res.send('-1');
		}

		const userRole = await server.roles.findOne({ roleID: user.roleID });

		// reqState, msgState, commentState (че)

		let appendix;

		let friendState = 0;
		if (userRole) var badgeLevel = userRole.badgeLevel;

		if (accountID == targetAccountID) {
			let newFriendRequests = await server.friendrequests.countDocuments({ toAccountID: accountID });
			// let newMessages = await server.messages.countDocuments({ toAccountID: accountID, isUnread: 1 });
			let newMessages = 2;
			let newFriends = await server.friends.countDocuments({
				$or: [
					{ accountID1: accountID, isUnread2: 1 },
					{ accountID2: accountID, isUnread1: 1 }]
			});

			appendix = ':' + jsonToRobtop([{
				'38': newMessages,
				'39': newFriendRequests,
				'40': newFriends
			}]);
		}
		else {
			let incomingRequests = await server.friendrequests.find({
				fromAccountID: targetAccountID, toAccountID: accountID
			});
			if (incomingRequests.length > 0) {
				friendState = 3;
				appendix = ':' + jsonToRobtop([{
					'32': incomingRequests.requestID,
					'35': incomingRequests.message,
					'37': 'send this to cafeed28: кафiф#5693'
				}]);
			}

			let outcomingRequests = await server.friendrequests.countDocuments({
				toAccountID: targetAccountID, fromAccountID: accountID
			});
			if (outcomingRequests > 0) friendState = 4;

			let friend = await server.friends.countDocuments({
				$or: [
					{ accountID1: accountID, accountID2: targetAccountID },
					{ accountID2: accountID, accountID1: targetAccountID }
				]
			});
			if (friend > 0) friendState = 1;
		}

		fc.success(`Получение статистики пользователя ${body.targetAccountID} выполнено`);

		return res.send(jsonToRobtop([{
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
			'49': badgeLevel,
			'50': '0' // commentState
		}]) + appendix);
	}
}