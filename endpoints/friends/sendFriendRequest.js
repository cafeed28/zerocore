const fc = require('fancy-console');
const { check } = require('../../lib/gjpcheck');

module.exports = {
	path: 'uploadFriendRequest20.php',
	aliases: ['uploadFriendRequest20'],
	requiredKeys: ['gjp', 'accountID', 'toAccountID', 'secret'],
	async execute(req, res, body, server) {
		const gjp = body.gjp;
		const accountID = body.accountID;
		const toAccountID = body.toAccountID;
		const message = body.comment;

		if (check(gjp, accountID)) {
			const user = await server.users.find({ accountID: toAccountID });
			const blocked = await server.blocks.find({ accountID1: toAccountID, accountID2: accountID });

			if (user.frS == 1 || blocked.length > 0) {
				fc.error(`Запрос в друзья аккаунта ${accountID} аккаунту ${toAccountID} не отправлен: ${accountID} заблокирован ${toAccountID}`);
				return res.send('-1');
			}

			const request = new server.friendrequests({
				requestID: (await server.friendrequests.find()).sort({ _id: -1 }).limit(1).requestID + 1,
				fromAccountID: accountID,
				toAccountID: toAccountID,
				message: message
			});

			request.save();

			fc.success(`Запрос в друзья аккаунта ${accountID} аккаунту ${toAccountID} отправлен`);
			return res.send('1');
		} else {
			fc.error(`Запрос в друзья аккаунта ${accountID} аккаунту ${toAccountID} не отправлен: ошибка авторизации`);
			return res.send('-1');
		}
	}
}