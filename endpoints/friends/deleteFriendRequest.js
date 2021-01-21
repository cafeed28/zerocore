const fc = require('fancy-console');
const { check } = require('../../lib/gjpcheck');

module.exports = {
    path: 'deleteGJFriendRequests20.php',
    aliases: ['deleteGJFriendRequests20'],
    requiredKeys: ['gjp', 'accountID', 'targetAccountID', 'isSender', 'secret'],
    async execute(req, res, body, server) {
        const gjp = body.gjp;
        const accountID = body.accountID;
        const toAccountID = body.targetAccountID;
        const isSender = body.isSender;

        if (check(gjp, accountID)) {
            if (isSender == 0) {
                await server.friendrequests.deleteOne({
                    fromAccountID: accountID,
                    toAccountID: toAccountID
                });
            } else if (isSender == 1) {
                await server.friendrequests.deleteOne({
                    fromAccountID: toAccountID,
                    toAccountID: accountID
                });
            } else {
                fc.error(`Запрос в друзья аккаунта ${accountID} аккаунту ${toAccountID} не удален: необработанное исключение`);
                return '-1';
            }

            fc.success(`Запрос в друзья аккаунта ${accountID} аккаунту ${toAccountID} удален`);
            return '1';
        } else {
            fc.error(`Запрос в друзья аккаунта ${accountID} аккаунту ${toAccountID} не удален: ошибка авторизации`);
            return '-1';
        }
    }
}