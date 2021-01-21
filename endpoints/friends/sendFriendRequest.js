const fc = require('fancy-console');
const { check } = require('../../lib/gjpcheck');

module.exports = {
    path: 'uploadFriendRequest20.php',
    aliases: ['uploadFriendRequest20'],
    requiredKeys: ['gjp', 'accountID', 'toAccountID', 'secret'],
    async execute(req, res, body, server) {
        const gjp = body.gjp;
        const accountID = body.accountID;
        const toAccountID = body.toAccountID;
        const message = body.comment;

        if (check(gjp, accountID)) {
            const request = new server.friendrequests({
                requestID: (await server.friendrequests.countDocuments()) + 1,
                fromAccountID: accountID,
                toAccountID: toAccountID,
                message: message
            });

            request.save();

            fc.success(`Запрос в друзья аккаунта ${accountID} аккаунту ${toAccountID} отправлен`);
            return '1';
        } else {
            fc.error(`Запрос в друзья аккаунта ${accountID} аккаунту ${toAccountID} не отправлен: ошибка авторизации`);
            return '-1';
        }
    }
}