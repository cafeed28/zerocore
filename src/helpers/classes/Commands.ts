import EPermissions from "../EPermissions"
import ICommand from "../interfaces/ICommand"
import { LevelModel } from "../models/level"
import GJHelpers from "./GJHelpers"

const commands = new Map()

const unrate: ICommand = { // unrate and save diff
    name: 'unrate',
    requiredPerms: [EPermissions.rateLevelStar],
    execute: (accountID, levelID, args) => {
        return new Promise(async (resolve, reject) => {
            let level = await LevelModel.findOne({ levelID: levelID })
            let diff: any = GJHelpers.getDiffFromStars(level.starDifficulty)

            await GJHelpers.rateLevel(accountID, levelID, 0, diff['diff'], false, false)
            await GJHelpers.featureLevel(accountID, levelID, false)
            await GJHelpers.verifyCoinsLevel(accountID, levelID, false)
            resolve(true)
        })
    }
}
commands.set(unrate.name, unrate)

const rate: ICommand = { // rate stars
    name: 'rate',
    requiredPerms: [EPermissions.rateLevelStar],
    execute: (accountID, levelID, args) => {
        return new Promise(async (resolve, reject) => {
            let stars = parseInt(args.shift())
            let level = await LevelModel.findOne({ levelID: levelID })
            let diff: any = GJHelpers.getDiffFromStars(stars)

            await GJHelpers.rateLevel(accountID, levelID, stars, diff['diff'], diff['auto'], diff['demon'])
            await GJHelpers.verifyCoinsLevel(accountID, levelID, true)
            resolve(true)
        })
    }
}
commands.set(rate.name, rate)

const diff: ICommand = { // unrate and set new diff
    name: 'diff',
    requiredPerms: [EPermissions.rateLevelDiff],
    execute: (accountID, levelID, args) => {
        return new Promise(async (resolve, reject) => {
            let level = await LevelModel.findOne({ levelID: levelID })
            let diff: any = GJHelpers.getDiffFromStars(parseInt(args[0]))

            await GJHelpers.rateLevel(accountID, levelID, 0, diff['diff'], false, false)
            resolve(true)
        })
    }
}
commands.set(diff.name, diff)

const feature: ICommand = { // set feature if rated
    name: 'feature',
    requiredPerms: [EPermissions.rateLevelFeatureEpic],
    execute: (accountID, levelID, args) => {
        return new Promise(async (resolve, reject) => {
            let level = await LevelModel.findOne({ levelID: levelID })
            if (level.starStars == 0) {
                return reject(false)
            }

            await GJHelpers.updateCreatorPoints(levelID)
            await GJHelpers.featureLevel(accountID, levelID, !!parseInt(args[0]))
            await GJHelpers.verifyCoinsLevel(accountID, levelID, true)
            resolve(true)
        })
    }
}
commands.set(feature.name, feature)

const epic: ICommand = { // set epic if rated
    name: 'epic',
    requiredPerms: [EPermissions.rateLevelFeatureEpic],
    execute: (accountID, levelID, args) => {
        return new Promise(async (resolve, reject) => {
            let level = await LevelModel.findOne({ levelID: levelID })
            if (level.starStars == 0) {
                return reject(false)
            }

            await GJHelpers.updateCreatorPoints(levelID)
            await GJHelpers.epicLevel(accountID, levelID, !!parseInt(args[0]))
            await GJHelpers.verifyCoinsLevel(accountID, levelID, true)
            resolve(true)
        })
    }
}
commands.set(epic.name, epic)

const daily: ICommand = { // set daily
    name: 'daily',
    requiredPerms: [EPermissions.setDailyWeeklyLevel],
    execute: (accountID, levelID, args) => {
        return new Promise(async (resolve, reject) => {
            await GJHelpers.setDailyLevel(levelID, false)
            resolve(true)
        })
    }
}
commands.set(daily.name, daily)

export default commands