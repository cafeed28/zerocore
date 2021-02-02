const fc = require('fancy-console');
const { check } = require('../../lib/gjpcheck');

module.exports = {
    path: 'deleteGJAccComment20.php',
    aliases: ['deleteGJAccComment20'],
    requiredKeys: ['gjp', 'commentID', 'accountID', 'secret'],
    async execute(req, res, body, server) {
        const gjp = body.gjp;
        const accountID = body.accountID;

        if (check(gjp, accountID)) {
            const post = await server.posts.deleteOne({
                postID: body.commentID,
            });
            console.log(post);
            if (post.deletedCount == 0) {
                fc.error(`Пост с аккаунта ${body.accountID} не удален: пост не найден`);
                return res.send('-1');
            } else {
                fc.success(`Пост с аккаунта ${body.accountID} удален`);
                return res.send('1');
            }

        } else {
            fc.error(`Пост с аккаунта ${body.accountID} не удален: ошибка авторизации`);
            return res.send('-1');
        }
    }
}