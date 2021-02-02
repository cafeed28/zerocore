const fc = require('fancy-console');
const { check } = require('../../lib/gjpcheck');

const fs = require('fs').promises;

module.exports = {
    path: 'uploadGJLevel21.php',
    aliases: ['uploadGJLevel21'],
    requiredKeys: ['accountID', 'levelName', 'levelDesc', 'audioTrack'],
    async execute(req, res, body, server) {
        const gjp = body.gjp || 0;
        const accountID = body.accountID;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        let levelID = body.levelID;
        const levelName = body.levelName;
        const levelDesc = body.levelDesc;
        const levelLength = body.levelLength;
        const audioTrack = body.audioTrack;
        const levelString = body.levelString;

        const auto = body.auto || 0;
        const password = body.password || 1;
        const original = body.original || 0;
        const twoPlayer = body.twoPlayer || 0;
        const songID = body.songID || 0;
        const objects = body.objects || 0;
        const coins = body.coins || 0;
        const requestedStars = body.requestedStars || 0;
        const extraString = body.extraString || '29_29_29_40_29_29_29_29_29_29_29_29_29_29_29_29';
        const unlisted = body.unlisted || 0;
        const ldm = body.ldm || 0;

        if (check(gjp, accountID)) {
            if (!levelString || !levelName) {
                fc.error(`Уровень на аккаунте ${body.userName} не опубликован: имя или уровень пустой`);
                return res.send('-1');
            }
            console.log('levelID: ' + levelID);

            if (levelID == 0) {
                levelID = (await server.levels.countDocuments()) + 1;
            } else {
                let level = await server.levels.findOne({ levelID: levelID });
                if (level && level.accountID != accountID) {
                    fc.error(`Уровень на аккаунте ${body.userName} не опубликован: уровень ${levelID} уже есть от другого автора`);
                    return res.send('-1');
                }
            }

            await server.levels.updateOne({ levelName: levelName, accountID: accountID }, {
                accountID: accountID,
                levelID: levelID,
                levelName: levelName,
                levelDesc: levelDesc,
                levelLength: levelLength,
                audioTrack: audioTrack,
                auto: auto,
                password: password,
                original: original,
                twoPlayer: twoPlayer,

                songID: songID,
                objects: objects,
                coins: coins,
                requestedStars: requestedStars,
                extraString: extraString,
                unlisted: unlisted,
                ldm: ldm,

                IP: ip
            }, { upsert: true });

            try {
                await fs.writeFile(`data/levels/${levelID}`, levelString);
            } catch (e) {
                fc.error(`Уровень на аккаунте ${body.userName} не опубликован: неизвестная ошибка\n${e.stack}`);
                return res.send('-1');
            }

            fc.success(`Уровень на аккаунте ${body.userName} опубликован`);
            return res.send(`${levelID}`);
        } else {
            fc.error(`Уровень на аккаунте ${body.userName} не опубликован: ошибка авторизации`);
            return res.send('-1');
        }
    }
}