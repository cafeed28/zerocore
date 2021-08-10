import config from '../../../config'
import log from '../../../logger'

import { Request, Response } from 'polka'
import { SongModel } from '../../../mongodb/models/song'

import axios from 'axios'
import API from '../../../helpers/API'

let path = `/${config.basePath}/api/songs/upload`
let required = ['songName', 'authorName', 'url']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    let songName = body.songName
    let authorName = body.authorName
    let url = body.url

    if (url.includes('dropbox.com')) {
        if (url.endsWith('dl=0')) {
            url = url.slice(0, -1) + '1'
        } else if (url.endsWith('dl=1')) {
            // ?
        } else url += '?dl=1'
    } else if (url.includes('soundcloud.com')) {
        let soundcloudKey = 'atcX6KFaz2y3iq7fJayIK779Hr4oGArb'
        let req
        try {
            req = await axios.get(`https://api.soundcloud.com/resolve.json?url=${url}&client_id=${soundcloudKey}`)
        }
        catch (err) {
            log.error(`Unknown error while uploading song ${url}`)
            log.error(err)
            return {
                'status': 'error',
                'code': 'unknownError'
            }
        }
        let soundcloudSong = JSON.parse(req.data)
        if (soundcloudSong.downloadable) {
            url = soundcloudSong.download_url + `?client_id=${soundcloudKey}`
            songName = soundcloudSong.title
            authorName = soundcloudSong.user.username.replace(/[^A-Za-z0-9 ]/, '')
        }
        else {
            if (!soundcloudSong.id) {
                log.info(`Cannot upload song ${authorName} - ${songName}: song is not downloadable`)
                return {
                    'status': 'error',
                    'code': 'notDownloadableSong'
                }
            }

            url = `https://api.soundcloud.com/tracks/${soundcloudSong.id}/stream?client_id=${soundcloudKey}`
            songName = soundcloudSong.title
            authorName = soundcloudSong.user.username.replace(/[^A-Za-z0-9 ]/, '')
            log.warn(`Song is not downloadable, trying to insert anyway`)
        }
    }

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

    if (!await API.verifySongUrl(url)) {
        log.info(`Cannot upload song ${authorName} - ${songName}: incorrect URL`)
        return {
            'status': 'error',
            'code': 'incorrectUrl'
        }
    }

    try {
        song = await SongModel.create({
            name: songName,
            authorID: 9,
            authorName: authorName,
            size: 0,
            download: url
        })
    }
    catch (err) {
        if (err.name == 'ValidationError') {
            if (err.kind == 'required') {
                return {
                    'status': 'error',
                    'code': 'requiredError'
                }
            }
        }

        log.error(`Unknown error while uploading song ${authorName} - ${songName}`)
        log.error(err)
        return {
            'status': 'error',
            'code': 'unknownError'
        }
    }

    log.info(`Song ${authorName} - ${songName} uploaded`)
    return {
        'status': 'success',
        'value': song.songID
    }
}

export { path, required, callback }