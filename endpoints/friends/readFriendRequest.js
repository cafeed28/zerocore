const fc = require('fancy-console');
const { check } = require('../../lib/gjp');

module.exports = {
	path: 'readGJFriendRequest20.php',
	aliases: ['readGJFriendRequest20'],
	requiredKeys: ['gjp', 'accountID', 'requestID', 'secret'],
	async execute(req, res, body, server) {
		const gjp = body.gjp;
		const accountID = body.accountID;
		const requestID = body.requestID;

		if (check(gjp, accountID)) {
			await server.friendrequests.findOneAndUpdate({
				requestID: requestID
			}, { isUnread: 0 });

			fc.success(`Запрос в друзья ${requestID} прочитан`);
			return res.send('1');
		} else {
			fc.error(`Запрос в друзья ${requestID} не прочитан: ошибка авторизации`);
			return res.send('-1');
		}
	}
}