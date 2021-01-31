const fc = require('fancy-console');

module.exports = {
    path: 'api/uploadSong',
    aliases: [],
    requiredKeys: ['songName', 'authorName', 'download', 'apiKey'],
    async execute(req, res, body, server) {
        const checkSong = await server.songs.findOne({
            name: body.songName.toLowerCase(),
            authorName: body.authorName.toLowerCase()
        });

        const checkSongDownload = await server.songs.findOne({
            download: body.download
        });

        if (checkSong || checkSongDownload) {
            fc.error(`Музыка ${body.authorName} - ${body.songName} не опубликована: такая музыка уже есть`);
            return {
                'status': 'error',
                'value': 'alreadyUploaded'
            };
        } else {
            const song = new server.songs({
                songID: (await server.songs.countDocuments()) + 5000000 + 1,
                name: body.songName,
                authorID: 9,
                authorName: body.authorName,
                size: 0,
                download: body.download
            });

            song.save();

            fc.success(`Музыка ${body.authorName} - ${body.songName} опубликована`);
            return {
                'status': 'success',
                'value': song.songID
            };
        }
    }
}