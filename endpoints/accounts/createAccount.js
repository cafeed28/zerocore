const fc = require('fancy-console');
const bcrypt = require('bcrypt');
const accountHelpers = require('../../helpers/accounts');
const { create } = require('domain');

module.exports = {
	path: 'accounts/registerGJAccount.php',
	aliases: ['accounts/registerGJAccount'],
	requiredKeys: ['userName', 'password', 'email', 'secret'],
	async execute(req, res, body, server) {
		const createAccount = await accountHelpers.createAccount(body.userName, body.password, body.email, server.accounts);

		if (createAccount == accountHelpers.status.alreadyExists) {
			fc.error(`Аккаунт ${body.userName} не создан: такой аккаунт уже существует`);
		} else {
			fc.success(`Аккаунт ${body.userName} создан`);
		}

		return res.send(createAccount);
	}
}