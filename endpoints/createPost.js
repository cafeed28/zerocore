const fc = require('fancy-console');
const bcrypt = require('bcrypt');
const { remove } = require('../lib/exploitPatch');
const { GJPCheck } = require('../lib/gjpcheck');

module.exports = {
    path: 'uploadGJAccComment.php',
    aliases: ['uploadGJAccComment'],
    requiredKeys: ['gjp', 'userName', 'comment', 'accountID'],
    async execute(req, res, body, server) {
        const gjp = remove(body.gjp);
        const userName = remove(body.userName);
        const comment = remove(body.comment);
        const accountID = remove(body.accountID);

        const gjpCheck = GJPCheck.check(gjp, accountID);

        console.log(body.comment);

        if (gjpCheck) {
            const post = new server.posts({
                accountID: accountID,
                userName: body.userName,
                password: bcrypt.hashSync(body.password, 10),
                email: body.email,
                secret: body.secret
            });
            post.save();

            fc.success(`Пост на аккаунте ${body.userName} создан`);
            return '1';
        } else {
            fc.error(`Пост на аккаунте ${body.userName} не создан: ошибка авторизации`);
            return '-1';
        }
    }
};