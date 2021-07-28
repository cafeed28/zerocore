import config from '../../config'
import log from '../../logger'
import { promises as fs } from 'fs'
import zlib from 'node-gzip'

import { Request, Response } from 'polka'
import { ActionModel } from '../../mongodb/models/action'
import { DailyModel } from '../../mongodb/models/daily'
import { LevelModel } from '../../mongodb/models/level'

import GJCrypto from '../../helpers/GJCrypto'
import GJHelpers from '../../helpers/GJHelpers'
import EActions from '../../helpers/EActions'
import EPermissions from '../../helpers/EPermissions'
import XOR from '../../helpers/XOR'

let path = `/${config.basePath}/downloadGJLevel22.php`
let required = ['levelID']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const accountID = body.accountID
    const gjp = body.gjp

    let levelID = body.levelID

    const time = Math.round(new Date().getTime() / 1000)
    // genious robtop thanks
    if (levelID == '-1') {
        let daily = await DailyModel.find({
            timestamp: {
                $lt: time,
            },
            type: 0,
        }).sort({ timestamp: -1 })

        levelID = daily[0].levelID
        var feaID = daily[0].feaID
    }
    // why -1/-2 when you can download id that returned getGJDailyLevel
    else if (levelID == '-2') {
        let daily = await DailyModel.find({
            timestamp: {
                $lt: time,
            },
            type: 1,
        }).sort({ timestamp: -1 })

        levelID = daily[0].levelID
        var feaID = daily[0].feaID + 100001
    }

    const level = await LevelModel.findOne({ levelID: levelID })

    if (!level) {
        log.info(`Downloading level ${levelID} error: level not found`)
        return '-1'
    }

    let levelString = ''
    try {
        levelString = await fs.readFile(
            `data/levels/${levelID}`,
            'utf8'
        )
    } catch (err) {
        if (err.code == 'ENOENT') {
            log.error(`Downloading level ${levelID} error: level not found`)
            return '-1'
        }

        log.error(`Downloading level ${levelID} error`)
        log.error(err)
        return '-1'
    }

    let dlAction = await ActionModel.findOne({
        actionType: EActions.levelDownload,
        itemID: levelID,
        IP: req.socket.remoteAddress
    })
    if (!dlAction) {
        await LevelModel.findOneAndUpdate(
            { levelID: levelID },
            { downloads: level.downloads + 1 }
        )
        await ActionModel.create({
            actionType: EActions.levelDownload,
            IP: req.socket.remoteAddress,
            timestamp: Date.now(),
            itemID: levelID,
        })
    }

    let pass = level.password
    if (
        (await GJHelpers.getAccountPermission(
            body.accountID,
            EPermissions.freeCopy
        )) == 1
    )
        pass = 1
    if (pass != 0) {
        var xorPass = Buffer.from(
            XOR.cipher(
                pass.toString(), 26364)
        ).toString('base64')
    } else var xorPass = pass.toString()

    if (levelString.substr(0, 3) == 'kS1') {
        levelString = Buffer.from(
            await zlib.gzip(levelString)
        ).toString('base64')
        levelString = levelString.replace('/', '_').replace('+', '-')
    }

    let response = GJHelpers.jsonToRobtop({
        1: level.levelID,
        2: level.levelName,
        3: level.levelDesc,
        4: levelString,
        5: level.levelVersion,
        6: level.accountID,
        8: 10,
        9: level.starDifficulty,
        10: level.downloads,
        11: 1,
        12: level.audioTrack,
        13: 21,
        14: level.likes,
        15: level.levelLength,
        17: +level.starDemon,
        18: level.starStars,
        19: +level.starFeatured,
        25: +level.starAuto,
        27: xorPass,
        28: level.uploadDate,
        29: level.updateDate,
        30: level.original,
        31: 1,
        35: level.songID,
        36: level.extraString,
        37: level.coins,
        38: +level.starCoins,
        39: level.requestedStars,
        40: level.ldm,
        42: +level.starEpic,
        43: level.starDemonDiff,
        45: level.objects,
        46: 1,
        47: 2,
        48: 1,
    })

    if (feaID) response += `:41:${feaID}`

    response += `#${GJCrypto.genSolo(levelString)}#`

    let someString: any = [
        level.accountID,
        level.starStars,
        +level.starDemon,
        level.levelID,
        +level.starCoins,
        +level.starFeatured,
        pass,
        0,
    ]
    // if (feaID) someString[someString.length] = feaID
    // someString = someString.join(',')

    response += GJCrypto.genSolo2(someString) + '#'
    if (feaID) {
        let userString = await GJHelpers.getUserString(level.accountID)
        response += userString
    }
    else {
        response += someString
    }

    log.info(`Downloading level ${levelID} success`)
    return response
}

export { path, required, callback }