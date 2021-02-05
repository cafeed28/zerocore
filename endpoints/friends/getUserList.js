const fc = require('fancy-console');
const moment = require('moment');
const { check } = require('../../lib/gjp');
const { jsonToRobtop } = require('../../lib/utils');

module.exports = {
	path: 'getGJUserList20.php',
	aliases: ['getGJUserList20'],
	requiredKeys: ['gjp', 'accountID', 'type'],
	async execute(req, res, body, server) {
		const gjp = body.gjp;
		const accountID = body.accountID;
		const type = body.type;

		if (check(gjp, accountID)) {
			let collection;
			let list;

			if (type == 0) {
				collection = server.friends;
				list = await collection.find().or([{
					accountID1: accountID
				}, {
					accountID2: accountID
				}]);
			} else if (type == 1) {
				collection = server.blocks;
				list = await collection.find({
					accountID1: accountID
				});
			}

			if (list.length == 0) {
				fc.error(`Получение списка пользователей типа ${type} не удалось: список пуст`);
				return res.send('-2');
			}

			let users = [];
			let isUnread = [];
			list.map(item => {
				user = item.accountID1 != accountID ? item.accountID1 : item.accountID2;
				isUnread[user] = item.accountID1 != accountID ? item.isUnread1 || 0 : item.isUnread2 || 0;

				users.push(user);
			});

			const usersList = await server.users.find().where('accountID').in(users);

			let usersString = '';
			usersList.map(user => {
				usersString += jsonToRobtop([{
					'1': user.userName,
					'2': user.accountID,
					'9': user.icon,
					'10': user.color1,
					'11': user.color2,
					'14': user.iconType,
					'15': user.special,
					'16': user.accountID,
					'17': user.userCoins,
					'18': '0',
					'41': isUnread[user.accountID],
				}]) + '|';
			});

			if (type == 0) {
				await server.friends.updateMany({ accountID2: accountID }, { isUnread1: 0 });
				await server.friends.updateMany({ accountID1: accountID }, { isUnread2: 0 });
			}

			console.log(usersString);

			fc.success(`Получение списка пользователей типа ${type} удалось`);
			return res.send(usersString);
		} else {
			fc.error(`Получение списка пользователей типа ${type} не удалось: ошибка авторизации`);
			return res.send('-1');
		}
	}
}