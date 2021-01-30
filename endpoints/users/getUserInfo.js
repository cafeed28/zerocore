const fc = require('fancy-console');
const { check } = require('../../lib/gjpcheck');
const { jsonToRobtop } = require('../../lib/utils');

module.exports = {
    path: 'getGJUserInfo20.php',
    aliases: ['getGJUserInfo20'],
    requiredKeys: ['targetAccountID'],
    async execute(req, res, body, server) {
        const gjp = body.gjp || 0;
        const targetAccountID = body.targetAccountID;
        const accountID = body.accountID || 0;

        if (accountID == 0 || gjp != 0) {
            if (!check(gjp, accountID)) {
                fc.error(`Получение статистики пользователя ${body.targetAccountID} не выполнено: неверный gjp`);
                return '-1';
            }
        }

        const blocked = await server.blocks.findOne({ accountID1: targetAccountID, accountID2: accountID });

        if (blocked) {
            fc.error(`Получение статистики пользователя ${body.targetAccountID} не выполнено: пользователь заблокировал вас`);
            return '-1';
        }

        const user = await server.users.findOne({ accountID: body.targetAccountID });

        if (!user) {
            fc.error(`Получение статистики пользователя ${body.targetAccountID} не выполнено: пользователь не найден`);
            return '-1';
        }

        // badge
        // youtube, twitch, twitter...
        // reqState, msgState, commentState (че)

        // friendRequests, messages, friends

        fc.success(`Получение статистики пользователя ${body.targetAccountID} выполнено`);

        return jsonToRobtop([{
            '1': user.userName,
            '2': targetAccountID,
            '3': user.stars,
            '4': user.demons,
            '8': user.creatorPoints,
            '10': user.color1,
            '11': user.color2,
            '13': user.coins,
            '16': targetAccountID,
            '17': user.userCoins,
            '18': '0', // msgState
            '19': '0', // reqsState
            '20': user.youtube || '',
            '21': user.accIcon,
            '22': user.accShip,
            '23': user.accBall,
            '24': user.accBird,
            '25': user.accDart,
            '26': user.accRobot,
            '28': user.accGlow,
            '29': '1', // спасибо кволтон за комментирование кода, че это такое
            '30': user.stars + 1,
            '31': '0', // friendReqState
            '43': user.accSpider,
            '44': user.twitter || '',
            '45': '', // twitch, когда выйдет blackTea от партура, удалю
            '46': user.diamonds,
            '47': user.accExplosion,
            '49': user.badge,
            '50': '0' // commentState
        }]);
    }
}