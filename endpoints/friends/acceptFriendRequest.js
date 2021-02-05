const fc = require('fancy-console');
const { check } = require('../../lib/gjpcheck');

module.exports = {
	path: 'acceptGJFriendRequest20.php',
	aliases: ['acceptGJFriendRequest20'],
	requiredKeys: ['gjp', 'accountID', 'targetAccountID', 'requestID', 'secret'],
	async execute(req, res, body, server) {
		const gjp = body.gjp;
		const accountID = body.accountID;
		const toAccountID = body.targetAccountID;
		const requestID = body.requestID;

		if (check(gjp, accountID)) {
			await server.friendrequests.deleteOne({
				requestID: requestID
			});

			const friend = new server.friends({
				ID: (await server.friends.find()).sort({ _id: -1 }).limit(1).ID + 1,
				accountID1: accountID,
				accountID2: toAccountID
			});

			friend.save();

			fc.success(`Запрос в друзья ${requestID} принят`);
			return res.send('1');
		} else {
			fc.error(`Запрос в друзья ${requestID} не принят: ошибка авторизации`);
			return res.send('-1');
		}
	}
}