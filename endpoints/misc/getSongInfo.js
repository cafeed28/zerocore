const fc = require('fancy-console');
const axios = require('axios');

module.exports = {
    path: 'getGJSongInfo.php',
    aliases: ['getGJSongInfo'],
    requiredKeys: ['songID', 'secret'],
    async execute(req, res, body, server) {
        const songID = body.songID;

        const song = await server.songs.findOne({ songID: songID });

        if (!song && songID > 5000000) {
            fc.error(`Получение информации музыки ${songID} не удалось: кастомная музыка не найдена`);
            return '-1';
        } else if (song) {
            let download = song.download;
            if (download.includes(':')) {
                download = encodeURIComponent(download);
            }

            result = `1~|~${song.songID}~|~2~|~${song.name}~|~3~|~${song.authorID}~|~4~|~${song.authorName}~|~5~|~${song.size}~|~6~|~~|~10~|~${download}~|~7~|~~|~8~|~0`;

            fc.success(`Получение информации музыки ${songID} удалось`);
            return result;
        }

        let songString = '';

        let params = new URLSearchParams();
        params.append('songID', songID);
        params.append('secret', body.secret);

        const bRes = await axios.post('http://www.boomlings.com/database/getGJSongInfo.php', params);
        songString = bRes.data;

        if (bRes.data == '-2' || bRes.data == '-1' || bRes.data == '') {
            fc.error(`Получение информации музыки ${songID} не удалось: музыка не найдена`);
            return '-1';
        }

        fc.success(`Получение информации музыки ${songID} удалось`);
        return songString;
    }
}