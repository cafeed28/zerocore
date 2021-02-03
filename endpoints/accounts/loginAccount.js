const fc = require('fancy-console');
const bcrypt = require('bcrypt');
const accountHelpers = require('../../helpers/accounts');

module.exports = {
	path: 'accounts/loginGJAccount.php',
	aliases: ['accounts/loginGJAccount'],
	requiredKeys: ['userName', 'password', 'secret'],
	async execute(req, res, body, server) {
		const loginAccount = await accountHelpers.loginAccount(body.userName, body.password, server.accounts);

		if (loginAccount == accountHelpers.status.dosentExists) {
			fc.error(`Вход в аккаунт ${body.userName} не выполнен: аккаунта не существует`);
		} else if (loginAccount == accountHelpers.status.incorrectPassword) {
			fc.error(`Вход в аккаунт ${body.userName} не выполнен: неверный пароль`);
		}
		else {
			fc.success(`Вход в аккаунт ${body.userName} выполнен`);
		}

		return res.send(loginAccount);
	}
}