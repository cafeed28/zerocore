const fc = require('fancy-console');
const { check } = require('../../lib/gjpcheck');

module.exports = {
    path: 'blockGJUser20.php',
    aliases: ['blockGJUser20'],
    requiredKeys: ['gjp', 'accountID', 'targetAccountID', 'secret'],
    async execute(req, res, body, server) {
        const gjp = body.gjp;
        const accountID = body.accountID;
        const toAccountID = body.targetAccountID;

        if (check(gjp, accountID)) {
            const block = new server.blocks({
                accountID1: accountID,
                accountID2: toAccountID
            });

            block.save();

            await server.friends.deleteOne({
                fromAccountID: accountID,
                toAccountID: toAccountID
            });

            await server.friendrequests.deleteOne({
                fromAccountID: accountID,
                toAccountID: toAccountID
            });

            fc.success(`Пользователь ${accountID} заблокировал пользователя ${toAccountID}`);
            return '1';
        } else {
            fc.error(`Пользователь ${accountID} не заблокировал пользователя ${toAccountID}: ошибка авторизации`);
            return '-1';
        }
    }
}