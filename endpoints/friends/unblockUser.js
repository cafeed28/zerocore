const fc = require('fancy-console');
const { check } = require('../../lib/gjp');

module.exports = {
	path: 'unblockGJUser20.php',
	aliases: ['unblockGJUser20'],
	requiredKeys: ['gjp', 'accountID', 'targetAccountID', 'secret'],
	async execute(req, res, body, server) {
		const gjp = body.gjp;
		const accountID = body.accountID;
		const toAccountID = body.targetAccountID;

		if (check(gjp, accountID)) {
			await server.blocks.findOneAndDelete({
				accountID1: accountID,
				accountID2: toAccountID
			});

			fc.success(`Пользователь ${accountID} разблокировал пользователя ${toAccountID}`);
			return res.send('1');
		} else {
			fc.error(`Пользователь ${accountID} не разблокировал пользователя ${toAccountID}: ошибка авторизации`);
			return res.send('-1');
		}
	}
}