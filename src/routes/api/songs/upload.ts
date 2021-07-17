import config from '../../../config'
import log from '../../../logger'

import { Request, Response } from 'polka'
import { SongModel } from '../../../mongodb/models/song'

import API from '../../../helpers/API'

let path = `/${config.basePath}/api/songs/upload`
let required = ['songName', 'authorName', 'url']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const songName = body.songName
    const authorName = body.authorName
    let url = body.url

    let song = await SongModel.findOne({
        $or: [
            { name: new RegExp(songName, 'i'), authorName: new RegExp(authorName, 'i') },
            { download: url }
        ]
    })

    if (song) {
        log.info(`Song ${authorName} - ${songName} already uploaded`)
        return {
            'status': 'error',
            'code': 'alreadyUploaded',
            'value': song.songID
        }
    }

    if (url.includes('dropbox.com')) {
        if (url.endsWith('dl=0')) {
            url = url.slice(0, -1) + '1'
        } else if (url.endsWith('dl=1')) {
            // ?
        } else url += '?dl=1'
    }

    if (!await API.verifySongUrl(url)) {
        log.info(`Cannot upload song ${authorName} - ${songName}: incorrect URL`)
        return {
            'status': 'error',
            'code': 'incorrectUrl'
        }
    }

    song = await SongModel.create({
        name: songName,
        authorID: 9,
        authorName: authorName,
        size: 0,
        download: url
    })

    log.info(`Song ${authorName} - ${songName} uploaded`)
    return {
        'status': 'success',
        'value': song.songID
    }
}

export { path, required, callback }