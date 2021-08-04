import EPermissions from './EPermissions'
import ICommand from './ICommand'
import { LevelModel } from '../mongodb/models/level'
import GJHelpers from './GJHelpers'

const commands = new Map()

const unrate: ICommand = { // unrate and save diff
    name: 'unrate',
    requiredPerms: [EPermissions.rateLevelStar],
    execute: async (accountID, levelID, args) => {
        let level = await LevelModel.findOne({ levelID: levelID })
        let diff: any = GJHelpers.getDiffFromStars(level.starDifficulty)

        await GJHelpers.rateLevel(accountID, levelID, 0, diff['diff'], false, false)
        await GJHelpers.featureLevel(accountID, levelID, false)
        await GJHelpers.epicLevel(accountID, levelID, false)
        await GJHelpers.verifyCoinsLevel(accountID, levelID, false)
        return true
    }
}
commands.set(unrate.name, unrate)

const rate: ICommand = { // rate stars
    name: 'rate',
    requiredPerms: [EPermissions.rateLevelStar],
    execute: async (accountID, levelID, args) => {
        let stars = parseInt(args.shift())
        if (stars <= 0)
            return false

        let diff: any = GJHelpers.getDiffFromStars(stars)

        await GJHelpers.rateLevel(accountID, levelID, stars, diff['diff'], diff['auto'], diff['demon'])
        await GJHelpers.verifyCoinsLevel(accountID, levelID, true)
        return true
    }
}
commands.set(rate.name, rate)

const diff: ICommand = { // unrate and set new diff
    name: 'diff',
    requiredPerms: [EPermissions.rateLevelDiff],
    execute: async (accountID, levelID, args) => {
        let level = await LevelModel.findOne({ levelID: levelID })
        let diff: any = GJHelpers.getDiffFromStars(parseInt(args[0]))

        await GJHelpers.rateLevel(accountID, levelID, 0, diff['diff'], false, false)
        return true
    }
}
commands.set(diff.name, diff)

const feature: ICommand = { // set feature if rated
    name: 'feature',
    requiredPerms: [EPermissions.rateLevelFeature],
    execute: async (accountID, levelID, args) => {
        let level = await LevelModel.findOne({ levelID: levelID })
        if (level.starStars == 0) {
            return false
        }

        await GJHelpers.featureLevel(accountID, levelID, !!parseInt(args[0]))
        await GJHelpers.verifyCoinsLevel(accountID, levelID, true)
        return true
    }
}
commands.set(feature.name, feature)

const epic: ICommand = { // set epic if rated
    name: 'epic',
    requiredPerms: [EPermissions.rateLevelEpic],
    execute: async (accountID, levelID, args) => {
        let level = await LevelModel.findOne({ levelID: levelID })
        if (level.starStars == 0 || level.starFeatured == false) {
            return false
        }

        await GJHelpers.epicLevel(accountID, levelID, !!parseInt(args[0]))
        await GJHelpers.verifyCoinsLevel(accountID, levelID, true)
        return true
    }
}
commands.set(epic.name, epic)

const daily: ICommand = { // set daily
    name: 'daily',
    requiredPerms: [EPermissions.setDailyWeeklyLevel],
    execute: async (accountID, levelID, args) => {
        await GJHelpers.setDailyLevel(levelID, false)
        return true
    }
}
commands.set(daily.name, daily)

const del: ICommand = { // delete level
    name: 'delete',
    requiredPerms: [EPermissions.moveLevelAcc],
    execute: async (accountID, levelID, args) => {
        await GJHelpers.deleteLevel(levelID)
        return true
    }
}
commands.set(del.name, del)

export default commands