const fc = require('fancy-console');
const bcrypt = require('bcrypt');

module.exports = {
	path: 'accounts/loginGJAccount.php',
	aliases: ['accounts/loginGJAccount'],
	requiredKeys: ['userName', 'password', 'secret'],
	async execute(req, res, body, server) {
		const account = await server.accounts.findOne({ userName: body.userName });

		if (!account) {
			fc.error(`Вход в аккаунт ${body.userName} не выполнен: аккаунта не существует`);
			return res.send('-1');
		} else {
			if (await bcrypt.compare(body.password, account.password)) {
				fc.success(`Вход в аккаунт ${body.userName} выполнен`);
				return res.send(`${account.accountID},${account.accountID}`);
			} else {
				fc.error(`Вход в аккаунт ${body.userName} не выполнен: неверный пароль`);
				return res.send('-12');
			}
		}
	}
}