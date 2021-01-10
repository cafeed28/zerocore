const fc = require('fancy-console');
const bcrypt = require('bcrypt');

module.exports = {
    path: 'accounts/registerGJAccount.php',
    aliases: ['accounts/registerGJAccount'],
    requiredKeys: ['userName', 'password', 'email', 'secret'],
    async execute(req, res, body, server) {
        const checkUser = await server.accounts.findOne({ userName: body.userName });

        if (checkUser) {
            fc.error(`Аккаунт ${body.userName} уже существует`);
            return '-2';
        } else {
            const ID = (await server.accounts.countDocuments()) + 1;

            const account = new server.accounts({
                accountID: ID,
                userName: body.userName,
                password: bcrypt.hashSync(body.password, 10),
                email: body.email,
                secret: body.secret
            });

            account.save();

            fc.success(`Аккаунт ${body.userName} создан`);
            return '1';
        }
    }
};