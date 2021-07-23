import config from '../../config'
import log from '../../logger'
import { promises as fs } from 'fs'

import { Request, Response } from 'polka'
import { LevelModel } from '../../mongodb/models/level'

import GJCrypto from '../../helpers/GJCrypto'
import API from '../../helpers/API'

let path = `/${config.basePath}/uploadGJLevel21.php`
let required = ['accountID', 'levelName', 'levelDesc', 'audioTrack', 'gjp']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const gjp = body.gjp || 0
    const accountID = body.accountID

    let levelID = body.levelID
    const levelName = body.levelName
    const levelDesc = body.levelDesc
    const levelLength = body.levelLength
    const levelVersion = body.levelVersion
    const audioTrack = body.audioTrack
    const levelString = body.levelString

    const auto = body.auto || 0
    const password = body.password || 1
    const original = body.original || 0
    const twoPlayer = body.twoPlayer || 0
    const songID = body.songID || 0
    const objects = body.objects || 0
    const coins = body.coins || 0
    const requestedStars = body.requestedStars || 0
    const extraString = body.extraString || '29_29_29_40_29_29_29_29_29_29_29_29_29_29_29_29'
    const unlisted = !!parseInt(body.unlisted || 0)
    const ldm = body.ldm || 0

    if (await GJCrypto.gjpCheck(gjp, accountID)) {
        if (!levelString) {
            log.info(`Cannot upload level ${levelName}: empty level`)
            return '-1'
        }
		
		if (levelName.length > 20){
			log.info(`Cannot upload level ${levelName}: too long name`)
			return -1
		}
		
		if (levelDesc.length > 150){
			log.info(`Cannot upload level ${levelName}: too long description`)
			return -1
		}

        if (levelID != 0) {
            let level = await LevelModel.findOne({ levelID: levelID })
            if (!level) {
                log.info(`Cannot update level ${levelName}: level not found`)
                return '-1'
            }
            if (level && level.accountID != accountID) {
                log.info(`Cannot update level ${levelName}: level uploaded on another account`)
                return '-1'
            }

            await LevelModel.updateOne({ levelID }, {
                accountID: accountID,
                levelName: levelName,
                levelDesc: levelDesc,
                levelLength: levelLength,
                levelVersion: levelVersion,
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

                updateDate: Math.round(Date.now() / 1000),
                IP: req.socket.remoteAddress
            })
        }

        let level = await LevelModel.create({
            accountID: accountID,
            levelName: levelName,
            levelDesc: levelDesc,
            levelLength: levelLength,
            levelVersion: levelVersion,
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

            uploadDate: Math.round(Date.now() / 1000),
            updateDate: Math.round(Date.now() / 1000),
            IP: req.socket.remoteAddress
        })

        try {
            await fs.mkdir(`data/levels`, { recursive: true })
            await fs.writeFile(`data/levels/${level.levelID}`, levelString)
        } catch (err) {
            log.error(`Cannot upload level ${levelName}`)
            log.error(err.stack)
            return '-1'
        }

        if (!await API.sendDiscordLog('Uploaded Level', `${accountID} uploaded a level ${levelName}(${levelID})`, `Song: ${songID}`)) {
            log.info(`Discord Webhook error`)
        }

        log.info(`Level ${level.levelID} uploaded`)
        return level.levelID
    } else {
        log.info(`Cannot upload level ${levelName} on account ${body.userName}: invalid GJP`)
        return '-1'
    }
}

export { path, required, callback }