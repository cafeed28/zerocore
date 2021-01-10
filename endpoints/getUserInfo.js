const fc = require('fancy-console');
const bcrypt = require('bcrypt');
const { remove } = require('../lib/exploitPatch');
const { check } = require('../lib/gjpcheck');

module.exports = {
    path: 'getGJUserInfo20.php',
    aliases: ['getGJUserInfo20'],
    requiredKeys: ['gjp', 'targetAccountID'],
    async execute(req, res, body, server) {
        const gjp = remove(body.gjp);
        const targetAccountID = remove(body.targetAccountID);
        const myAccountID = remove(body.accountID) || 0;

        if (myAccountID == 0) {
            if (!check(gjp, myAccountID)) {
                fc.error(`Получение статистики аккаунта ${body.targetAccountID} не выполнено: неверный gjp`);
                return '-1';
            }
        }

        const blocked = await server.blocks.findOne({ blockedID: myAccountID, blockerID: targetAccountID });

        if (blocked) {
            fc.error(`Получение статистики аккаунта ${body.targetAccountID} не выполнено: пользователь заблокировал вас`);
            return '-1';
        }

        const user = await server.users.findOne({ accountID: body.targetAccountID });

        if (!user) {
            fc.error(`Получение статистики аккаунта ${body.targetAccountID} не выполнено: пользователь не найден`);
            return '-1';
        }

        // badge
        // youtube, twitch, twitter...
        // reqState, msgState, commentState (че)

        // friendRequests, messages, friends

        // ":18:".$msgstate.":31:".$friendstate.":44:".$accinfo["twitter"].":45:".$accinfo["twitch"].":29:1:49:".$badge . $appendix

        return `1:${user.userName}:2:${targetAccountID}:13:${user.coins}:17:${user.userCoins}:10:${user.color1}:11:${user.color2}:3:${user.stars}:46:${user.diamonds}:4:${user.demons}:8:${user.creatorPoints}:18:0:19:0:50:0:20:${user.youtube}:21:${user.accIcon}:22:${user.accShip}:23:${user.accBall}:24:${user.accBird}:25:${user.accDart}:26:${user.accRobot}:28:${user.accGlow}:43:${user.accSpider}:47:${user.accExplosion}:30:${user.stars + 1}:16:${targetAccountID}:31:0:44:${user.twitter}:45:${user.twitch}:29:1:49:0`;

        // if (!account) {
        //     fc.error(`Аккаунта ${body.userName} не существует`);
        //     return '-1';
        // } else {
        //     if (bcrypt.compareSync(body.password, account.password)) {
        //         fc.success(`Вход в аккаунт ${body.userName} выполнен`);
        //         return `${account.accountID},${account.accountID}`;
        //     } else {
        //         fc.error(`Вход в аккаунт ${body.userName} не выполнен: неверный пароль`);
        //         return '-12';
        //     }
        // }
    }
};