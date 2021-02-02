const fc = require('fancy-console');
const { check } = require('../../lib/gjpcheck');

module.exports = {
    path: 'updateGJAccSettings20.php',
    aliases: ['updateGJAccSettings20'],
    requiredKeys: ['gjp', 'accountID', 'mS', 'frS', 'cS', 'yt', 'twitter', 'twitch', 'secret'],
    async execute(req, res, body, server) {
        const gjp = body.gjp;
        const accountID = body.accountID;
        const mS = body.mS;
        const frS = body.frS;
        const cS = body.cS;
        const yt = body.yt;
        const twitter = body.twitter;
        const twitch = body.twitch;

        if (check(gjp, accountID)) {
            await server.users.findOneAndUpdate({
                accountID: accountID
            }, {
                mS: mS,
                frS: frS,
                cS: cS,
                youtube: yt,
                twitter: twitter,
                twitch: twitch
            });

            fc.success(`Настройки пользователя ${accountID} обновлены`);
            return res.send('1');
        } else {
            fc.error(`Настройки пользователя ${accountID} не обновлены: ошибка авторизации`);
            return res.send('-1');
        }
    }
}