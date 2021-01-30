const fc = require('fancy-console');
const { jsonToRobtop, getUserString, getSongString, genMulti } = require('../../lib/utils');

module.exports = {
    path: 'getGJLevels21.php',
    aliases: ['getGJLevels21'],
    requiredKeys: ['page', 'str'],
    async execute(req, res, body, server) {
        const page = body.page;

        let levelsString = '';
        let levelsMultiString = '';
        let usersString = '';
        let songsString = '';

        // const levels = await server.levels.find({ levelName: new RegExp(body.str, 'i') });
        const levels = await server.levels.find();

        if (!levels.length) {
            fc.error(`Получение уровней не выполнено: уровни не найдены`);
            return '-1';
        } else {
            await Promise.all(levels.map(async(level) => {
                levelsMultiString += level.levelID + ',';

                if (level.songID != 0) {
                    songsString += await getSongString(level.songID) + '~:~';
                }

                usersString += await getUserString(level.accountID) + '|';

                const levelString = jsonToRobtop([{
                    '1': level.levelID,
                    '2': level.levelName,
                    '3': level.levelDesc,
                    '5': level.version,
                    '6': level.accountID,
                    '8': '10',
                    '9': level.starDifficulty,
                    '10': level.downloads,
                    '12': level.audioTrack,
                    '13': '21',
                    '14': '35',
                    '15': level.levelLength,
                    '17': level.starDemon,
                    '18': level.starStars,
                    '19': level.starFeatured,
                    '25': level.starAuto,
                    '30': level.original,
                    '31': '0',
                    '35': level.songID,
                    '37': level.coins,
                    '38': level.starCoins,
                    '39': level.requestedStars,
                    '40': level.ldm,
                    '42': level.starEpic,
                    '43': level.starDemonDiff,
                    '45': level.objects,
                    '46': '1',
                    '47': '2',
                }]) + '|';

                levelsString += levelString;
            }));

            levelsString = levelsString.slice(0, -1);
            levelsMultiString = levelsMultiString.slice(0, -1);
            usersString = usersString.slice(0, -1);
            songsString = songsString.slice(0, -3);

            let hash = await genMulti(levelsMultiString)
            if (!hash) {
                fc.success(`Получение уровней не выполнено: hash = false`);
                return '-1';
            }

            fc.success(`Получение уровней выполнено`);

            const result = `${levelsString}#${usersString}#${songsString}#${levels.length}:${page * 10}:10#${hash}`;
            return result;
        }
    }
}