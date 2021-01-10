const fc = require('fancy-console');
const { remove } = require('../lib/exploitPatch');
const { check } = require('../lib/gjpcheck');

module.exports = {
    path: 'updateGJUserScore.php',
    aliases: ['updateGJUserScore', 'updateGJUserScore22.php', 'updateGJUserScore'],
    requiredKeys: ['userName', 'secret', 'stars', 'demons', 'icon', 'color1', 'color2', 'gjp'],
    async execute(req, res, body, server) {
        const userName = remove(body.userName).replace(/[^A-Za-z0-9 ]/, '');
        const secret = remove(body.secret);
        const stars = remove(body.stars);
        const demons = remove(body.demons);
        const icon = remove(body.icon);
        const color1 = remove(body.color1);
        const color2 = remove(body.color2);

        const coins = remove(body.coins) || 0;
        const userCoins = remove(body.userCoins) || 0;
        const diamonds = remove(body.diamonds) || 0;
        const special = remove(body.special) || 0;

        const iconType = remove(body.iconType) || 0;
        const accIcon = remove(body.accIcon) || 0;
        const accShip = remove(body.accShip) || 0;
        const accBall = remove(body.accBall) || 0;
        const accBird = remove(body.accBird) || 0;
        const accDart = remove(body.accDart) || 0;
        const accRobot = remove(body.accRobot) || 0;
        const accSpider = remove(body.accSpider) || 0;
        const accGlow = remove(body.accGlow) || 0;
        const accExplosion = remove(body.accExplosion) || 0;

        if (!body.udid && !body.accountID) {
            fc.error(`Обновление статистики аккаунта ${body.userName} не выполнено: udid и accountID отсутствуют`);
            return '-1';
        }

        if (body.udid) {
            if (!isNaN(remove('udid'))) {
                fc.error(`Обновление статистики аккаунта ${body.userName} не выполнено: udid - числовой`);
                return '-1';
            }
        }

        const id = remove(body.accountID);

        if (!check(remove(body.gjp), id)) {
            fc.error(`Обновление статистики аккаунта ${body.userName} не выполнено: неверный gjp`);
            return '-1';
        }

        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        await server.users.updateOne({ accountID: id }, {
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

        fc.success(`Обновление статистики аккаунта ${body.userName} выполнено`);
        return id;
    }
};