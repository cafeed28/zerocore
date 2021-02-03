const fc = require('fancy-console');
const fs = require('fs').promises;
const utils = require('../../lib/utils');

module.exports = {
	path: 'getAccountURL.php/database/accounts/syncGJAccountNew.php',
	aliases: ['accounts/syncGJAccountNew', 'getAccountURL.php/database/accounts/syncGJAccountNew', 'getAccountURL.php/database/accounts/syncGJAccountNew.php'],
	requiredKeys: ['userName', 'password'],
	async execute(req, res, body, server) {
		const userName = body.userName;
		const password = body.password;
		const accountID = (await server.accounts.findOne({ userName: userName })).accountID;

		if (await utils.isValid(userName, password)) {
			let saveData;
			try {
				saveData = await fs.readFile(`data/saves/${accountID}`, 'utf8');
			}
			catch (e) {
				fc.error(`Восстановление аккаунта ${userName} не выполнено: `, e.stack);
				return '-1'
			}

			fc.success(`Восстановление аккаунта ${userName} выполнено`);
			return res.send(`${saveData};21;30;a;a`);
		}
		else {
			fc.success(`Восстановление аккаунта ${userName} не выполнено: ошибка авторизации`);
			return res.send('-1');
		}
	}
}