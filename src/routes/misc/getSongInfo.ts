import config from '../../config'
import log from '../../logger'
import axios from 'axios'

import { Request, Response } from 'polka'
import { SongModel } from '../../mongodb/models/song'

import GJHelpers from '../../helpers/GJHelpers'

let path = `/${config.basePath}/getGJSongInfo.php`
let required = ['songID', 'secret']
let callback = async (req: Request, res: Response) => {
    const body = req.body
    const songID = body.songID

    const song = await SongModel.findOne({ songID: songID })

    if (!song && songID > 5000000) {
        log.info(`Custom song ${songID} not found`)
        return '-1'
    } else if (song) {
        let download = song.download
        if (download.includes(':')) {
            download = encodeURIComponent(download)
        }

        let result = GJHelpers.jsonToRobtop({
            1: song.songID,
            2: song.name,
            3: song.authorID,
            4: song.authorName,
            5: song.size,
            6: '',
            7: '',
            8: 0,
            10: download
        }, '~|~')

        log.info(`Custom song ${songID} info recieved`)
        return result
    }

    let songString = ''

    let params = new URLSearchParams()
    params.append('songID', songID)
    params.append('secret', body.secret)

    const bRes = await axios.post('http://www.boomlings.com/database/getGJSongInfo.php', params)
    songString = bRes.data

    if (bRes.data == '-2' || bRes.data == '-1' || bRes.data == '') {
        log.info(`Song ${songID} not found`)
        return '-1'
    }

    log.info(`Song ${songID} info recieved`)
    return songString
}

export { path, required, callback }