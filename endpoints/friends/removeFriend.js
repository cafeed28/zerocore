const fc = require('fancy-console');
const { check } = require('../../lib/gjpcheck');

module.exports = {
    path: 'removeGJFriend20.php',
    aliases: ['removeGJFriend20'],
    requiredKeys: ['gjp', 'accountID', 'targetAccountID', 'secret'],
    async execute(req, res, body, server) {
        const gjp = body.gjp;
        const accountID = body.accountID;
        const targetAccountID = body.targetAccountID;

        if (check(gjp, accountID)) {
            await server.friends.findOneAndDelete({ accountID1: accountID, accountID2: targetAccountID });
            await server.friends.findOneAndDelete({ accountID2: accountID, accountID1: targetAccountID });

            fc.success(`${targetAccountID} удален из друзей ${accountID}`);
            return '1';
        } else {
            fc.error(`${targetAccountID} не удален из друзей ${accountID}: ошибка авторизации`);
            return '-1';
        }
    }
}