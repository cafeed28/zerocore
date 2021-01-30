const fc = require('fancy-console');
const { check } = require('../../lib/gjpcheck');

module.exports = {
    path: 'updateGJUserScore22.php',
    aliases: ['updateGJUserScore22'],
    requiredKeys: ['userName', 'secret', 'stars', 'demons', 'icon', 'color1', 'color2', 'gjp'],
    async execute(req, res, body, server) {
        const userName = body.userName.replace(/[^A-Za-z0-9 ]/, '');
        const stars = body.stars;
        const demons = body.demons;
        const icon = body.icon;
        const color1 = body.color1;
        const color2 = body.color2;

        const coins = body.coins || 0;
        const userCoins = body.userCoins || 0;
        const diamonds = body.diamonds || 0;
        const special = body.special || 0;

        const iconType = body.iconType || 0;
        const accIcon = body.accIcon || 0;
        const accShip = body.accShip || 0;
        const accBall = body.accBall || 0;
        const accBird = body.accBird || 0;
        const accDart = body.accDart || 0;
        const accRobot = body.accRobot || 0;
        const accSpider = body.accSpider || 0;
        const accGlow = body.accGlow || 0;
        const accExplosion = body.accExplosion || 0;

        if (!body.udid && !body.accountID) {
            fc.error(`Обновление статистики пользователя ${body.userName} не выполнено: udid и accountID отсутствуют`);
            return '-1';
        }

        if (body.udid) {
            if (!isNaN(body.udid)) {
                fc.error(`Обновление статистики пользователя ${body.userName} не выполнено: udid числовой`);
                return '-1';
            }
        }

        const id = body.accountID;

        if (!await server.accounts.findOne({ accountID: id })) {
            fc.success(`Обновление статистики пользователя ${body.userName} не выполнено: аккаунта не существует`);
            return '-1';
        }

        if (!check(body.gjp, id)) {
            fc.error(`Обновление статистики пользователя ${body.userName} не выполнено: неверный gjp`);
            return '-1';
        }

        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        await server.users.updateOne({ accountID: id }, {
            userName: userName,
            coins: coins,
            userCoins: userCoins,
            stars: stars,
            diamonds: diamonds,
            special: special,
            demons: demons,

            color1: color1,
            color2: color2,
            icon: icon,
            iconType: iconType,

            accIcon: accIcon,
            accShip: accShip,
            accBall: accBall,
            accBird: accBird,
            accDart: accDart,
            accRobot: accRobot,
            accSpider: accSpider,
            accGlow: accGlow,
            accExplosion: accExplosion,

            IP: ip,
            lastPlayed: new Date().getTime(),
        }, { upsert: true });

        fc.success(`Обновление статистики пользователя ${body.userName} выполнено`);
        return id;
    }
}