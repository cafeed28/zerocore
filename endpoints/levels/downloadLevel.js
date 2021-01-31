const fc = require('fancy-console');
const fs = require('fs').promises;
const xor = require('../../lib/xor');
const { jsonToRobtop, genSolo, genSolo2 } = require('../../lib/utils');
const zlib = require('zlib');

module.exports = {
    path: 'downloadGJLevel22.php',
    aliases: ['downloadGJLevel22'],
    requiredKeys: ['levelID'],
    async execute(req, res, body, server) {
        const levelID = body.levelID;

        const level = await server.levels.findOne({ levelID: levelID })

        if (!level) {
            fc.error(`Скачивание уровня ${levelID} не выполнено: уровень не найден в бд`);
            return '-1';
        }

        let levelString = '';
        try {
            levelString = (await fs.readFile(`data/levels/${levelID}`)).toString();
        } catch (e) {
            fc.error(e);
            fc.error(`Скачивание уровня ${levelID} не выполнено: файл уровня не найден`);
            return '-1';
        }

        if (!levelString) {
            fc.error(`Скачивание уровня ${levelID} не выполнено: файл уровня не найден`);
            return '-1';
        }

        await server.levels.findOneAndUpdate({ levelID: levelID }, { downloads: level.downloads + 1 });

        let pass = level.password;
        let xorPass = pass;
        // if(checkModPerms('freeCopy')) pass = 1
        if (pass != 0) {
            xorPass = Buffer.from(xor.cipher(pass, 26364)).toString('base64');
        }

        if (levelString.substr(0, 3) == 'kS1') {
            levelString = Buffer.from(zlib.gzip(levelString)).toString('base64');
            levelString = levelString.replace('/', '_');
            levelString = levelString.replace('+', '-');
        }

        let response = jsonToRobtop([{
            '1': level.levelID,
            '2': level.levelName,
            '3': level.levelDesc,
            '4': levelString,
            '5': '1',
            '6': level.accountID,
            '8': '10',
            '9': level.starDifficulty,
            '10': level.downloads,
            '11': '1',
            '12': level.audioTrack,
            '13': '21',
            '14': level.likes,
            '17': level.starDemon,
            '43': level.starDemonDiff,
            '25': level.starAuto,
            '18': level.starStars,
            '19': level.starFeatured,
            '42': level.starEpic,
            '45': level.objects,
            '15': level.levelLength,
            '30': level.original,
            '31': '1',
            '28': 'upload',
            '29': 'update',
            '35': level.songID,
            '36': level.extraString,
            '37': level.coins,
            '38': level.starCoins,
            '39': level.requestedStars,
            '46': '1',
            '47': '2',
            '48': '1',
            '40': level.ldm,
            '27': xorPass,
        }]);

        response += `#${genSolo(levelString)}#`;

        let someString = [level.accountID,
            level.starStars,
            level.starDemon,
            level.levelID,
            level.starCoins,
            level.starFeatured, pass, 0
        ].join(',');

        response += genSolo2(someString) + '#';
        response += someString;

        fc.success(`Скачивание уровня ${levelID} выполнено`);
        console.log(response.split('#'));
        return response;
    }
}