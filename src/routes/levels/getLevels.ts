import config from '../../config'
import log from '../../logger'
import { promises as fs } from 'fs'

import { Request, Response } from 'polka'
import { FriendModel } from '../../mongodb/models/friend'
import { GauntletModel } from '../../mongodb/models/gauntlet'
import { LevelModel } from '../../mongodb/models/level'

import GJHelpers from '../../helpers/GJHelpers'
import GJCrypto from '../../helpers/GJCrypto'

let path = `/${config.basePath}/getGJLevels21.php`
let required = []
let callback = async (req: Request, res: Response) => {
    const body = req.body

    let levelsList = []
    let levelsMultiString = ''
    let usersList = []
    let songsList = []
    let orderBy: any = { likes: -1 }
    let params: any = {}

    let diff = body.diff || '-'
    const page = parseInt(body.page)

    // search params
    if (body.featured == 1) params.starFeatured = true
    if (body.original == 1) params.original = true
    if (body.coins == 1) {
        params.starCoins = true
        params.coins = { $gt: 0 }
    }
    if (body.epic == 1) params.starEpic = true

    if (body.uncompleted == 1 && body.completedLevels) {
        let completed = body.completedLevels.replace(/[^0-9,]/g, '').split(',')
        params.levelID = { $nin: completed }
    }
    if (body.onlyCompleted == 1 && body.completedLevels) {
        let completed = body.completedLevels.replace(/[^0-9,]/g, '').split(',')
        params.levelID = { $in: completed }
    }

    if (body.song) {
        if (body.customSong) {
            params.songID = parseInt(body.song)
        } else {
            params.audioTrack = parseInt(body.song) - 1
            params.songID = 0
        }
    }

    if (body.twoPlayer == 1) params.twoPlayer = 1
    if (body.star) params.starStars != 0
    if (body.noStar) params.starStars = 0

    if (body.gauntlet) {
        orderBy = {}
        let gauntlet = await GauntletModel.findOne({
            packID: body.gauntlet,
        })

        let lvls = [
            gauntlet.levelID1,
            gauntlet.levelID2,
            gauntlet.levelID3,
            gauntlet.levelID4,
            gauntlet.levelID5,
        ]

        params = { levelID: { $in: lvls.map(Number) } }
    }

    if (body.len && body.len != '-') {
        params.levelLength = { $in: parseInt(body.len.split(',')) }
    }

    // diff filters
    if (diff == -1) {
        params.starDifficulty = 0
    } else if (diff == -3) {
        params.starAuto = true
    } else if (diff == -2) {
        let filter = parseInt(body.demonFilter) || 0

        params.starDemon = true
        if (filter == 1) params.starDemonDiff = 3
        if (filter == 2) params.starDemonDiff = 4
        if (filter == 3) params.starDemonDiff = 0
        if (filter == 4) params.starDemonDiff = 5
        if (filter == 5) params.starDemonDiff = 6
    } else {
        if (diff != '-') {
            diff = diff.replace(',', '0,') + '0'
            diff = diff.split(',')
            params.starDifficulty = { $in: diff }
        }
    }

    if (!parseInt(body.str)) params.levelName = new RegExp(body.str, "i")
    else params.levelID = body.str // search one by ID

    // search levels by IDs like '4,5,6' = [4, 5, 6]
    if (body.str)
        if (body.str.includes(','))
            params = { levelID: { $in: body.str.split(',').map(Number) } }

    // type
    if (body.type == 0 || body.type == 15) {
        // 15 in gdw, idk for what
        orderBy = { likes: -1 }
        if (body.str) {
            if (!isNaN(body.str)) {
                params = { levelID: body.str }
            }
        }
    } else if (body.type == 1) {
        orderBy = { downloads: -1 }
    } else if (body.typed == 2) {
        orderBy = { likes: -1 }
    } else if (body.type == 3) {
        // trending
        params = {
            uploadDate: { $lt: Math.round(Date.now() / 1000) - 7 * 24 * 60 * 60 },
        }
    } else if (body.type == 4) {
        orderBy = { levelID: -1 }
    } else if (body.type == 5) {
        params = { accountID: parseInt(body.str) }
        orderBy = { levelID: -1 }
    } else if (body.type == 6 || body.type == 17) { // featured
        params.starFeatured = true
        orderBy = { rateDate: -1, uploadDate: -1 }
    } else if (body.type == 16) { // hall of fame
        params.starEpic = true
        orderBy = { rateDate: -1, uploadDate: -1 }
    } else if (body.type == 7) {
        // magic
        params.objects = { $gt: 9999 }
    } else if (body.type == 11) {
        // awarded
        params.starStars = { $gt: 0 }
        orderBy = { rateDate: -1, uploadDate: -1 }
    } else if (body.type == 12) {
        // followed
        params.accountID = { $in: body.followed.split(',') }
    } else if (body.type == 13) {
        // friends
        if (await GJCrypto.gjpCheck(body.gjp, body.accountID)) {
            const friends = await FriendModel.find({ accountID1: body.accountID })
            const friendsIDs = friends.map((f) => f.accountID2)

            params.accountID = { $in: friendsIDs }
        }
    }

    if (body.coins == 1) {
        params.starCoins = 1
        params.coins = 0
    }

    console.log(params)
    console.log(orderBy)

    const levels = await LevelModel.find(params)
        .sort(orderBy)
        .skip(page * 10)
        .limit(10)
    const levelsCount = await LevelModel.countDocuments(params)

    if (!levels.length) {
        return '-1'
    } else {
        for (const level of levels) {
            if (params.accountID) {
                if (!await GJCrypto.gjpCheck(body.gjp, params.accountID)) {
                    if (level.unlisted == true && !params.levelID) continue
                }
            }
            else if (level.unlisted == true && !params.levelID) continue

            levelsMultiString += level.levelID + ','

            if (level.songID != 0) {
                const song = await GJHelpers.getSongString(level.songID)
                if (song) songsList.push(song)
            }

            const user = await GJHelpers.getUserString(level.accountID)
            usersList.push(user)

            const levelString = GJHelpers.jsonToRobtop({
                1: level.levelID,
                2: level.levelName,
                3: level.levelDesc,
                5: level.levelVersion || 0,
                6: level.accountID,
                8: 10,
                9: level.starDifficulty,
                10: level.downloads,
                12: level.audioTrack,
                13: 21,
                14: level.likes,
                15: level.levelLength,
                17: +level.starDemon,
                18: +level.starStars,
                19: +level.starFeatured,
                25: +level.starAuto,
                30: level.original,
                31: 0,
                35: level.songID,
                37: level.coins,
                38: +level.starCoins,
                39: level.requestedStars,
                40: level.ldm,
                42: +level.starEpic,
                43: level.starDemonDiff,
                45: level.objects,
                46: 1,
                47: 2,
            })

            levelsList.push(levelString)
        }

        levelsMultiString = levelsMultiString.slice(0, -1)

        let hash = await GJCrypto.genMulti(levelsMultiString)
        if (!hash) {
            log.info(`Levels recieving error: empty hash`)
            return '-1'
        }

        const result = `${levelsList.join('|')}#${usersList.join('|')}#${songsList.join('~:~')}#${levelsCount}:${page * 10}:10#${hash}`

        log.info(`Levels recieved`)
        return result
    }
}

export { path, required, callback }