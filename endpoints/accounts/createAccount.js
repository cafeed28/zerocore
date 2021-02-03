const fc = require('fancy-console');
const bcrypt = require('bcrypt');

module.exports = {
	path: 'accounts/registerGJAccount.php',
	aliases: ['accounts/registerGJAccount'],
	requiredKeys: ['userName', 'password', 'email', 'secret'],
	async execute(req, res, body, server) {
		const checkUser = await server.accounts.findOne({ userName: body.userName });

		if (checkUser) {
			fc.error(`Аккаунт ${body.userName} не создан: такой аккаунт уже существует`);
			return res.send('-2');
		} else {
			const account = new server.accounts({
				accountID: (await server.accounts.countDocuments()) + 1,
				userName: body.userName,
				password: await bcrypt.hash(body.password, 10),
				email: body.email,
				secret: body.secret
			});

			account.save();

			fc.success(`Аккаунт ${body.userName} создан`);
			return res.send('1');
		}
	}
}