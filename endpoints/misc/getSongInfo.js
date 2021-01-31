const fc = require('fancy-console');
const request = require('request');
const util = require('util');
const post = util.promisify(request.post);

module.exports = {
    path: 'getGJSongInfo.php',
    aliases: ['getGJSongInfo'],
    requiredKeys: ['songID', 'secret'],
    async execute(req, res, body, server) {
        const songID = body.songID;

        if (songID > 5000000) {
            fc.error(`Получение информации музыки ${songID} не удалось: музыка не найдена`);
            return '-1';
        }

        let result = '';

        post('http://www.boomlings.com/database/getGJSongInfo.php', {
            json: {
                songID: songID,
                secret: body.secret
            }
        }).then((err, res, body) => {
            if (err) {
                fc.error(`Получение информации музыки ${songID} не удалось: ошибка запроса`);
                return '1';
            }

            if (res == '-2' || res == '-1' || res == '') {
                post('http://www.boomlings.com/database/getGJLevels21.php', {
                    json: {
                        gameVersion: '21',
                        binaryVersion: '33',
                        gdw: 0,
                        type: 0,
                        str: '',
                        diff: '-',
                        len: '-',
                        page: 0,
                        total: 9999,
                        uncompleted: 0,
                        onlyCompleted: 0,
                        featured: 0,
                        original: 0,
                        twoPlayer: 0,
                        coins: 0,
                        epic: 0,
                        song: songID,
                        customSong: 1,
                        secret: 'Wmfd2893gb7'
                    }
                }).then((err, res, body) => {
                    if ('1~|~' + songID + '~|~2'.indexOf(res) != 0) {
                        result = res.split('#')[2];
                    } else {
                        post('https://www.newgrounds.com/audio/listen/' + songID).then((err, res, body) => {
                            if (!res.split('"url":"')[1]) {
                                fc.error(`Получиение информации музыки ${songID} не удалось: url отсутствует`);
                                return '-1';
                            }
                            let songUrl = res.split('"url":"')[1].split('","')[0];
                            let songAuthor = res.split('artist":"')[1].split('","')[0];
                            songUrl = songUrl.replace('\/', '/');
                            let songName = res.split('<title>')[0].split('</title>')[1];

                            if (songUrl == '') {
                                fc.error(`Получение информации музыки ${songID} не удалось: songUrl пустой`);
                                return '-1';
                            }

                            result = `1~|~${songID}~|~2~|~${songName}~|~3~|~1234~|~4~|~${songAuthor}~|~5~|~6.69~|~6~|~~|~10~|~${songUrl}~|~7~|~~|~8~|~1`;
                        });
                    }
                });
            }
        });

        fc.success(`Получение информации музыки ${songID} удалось`);
        return result;
    }
}