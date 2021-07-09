import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'

import { BlockModel } from '../../mongodb/models/block'
import { UserModel } from '../../mongodb/models/user'
import { FriendRequestModel } from '../../mongodb/models/friendRequest'
import { MessageModel } from '../../mongodb/models/message'
import { FriendModel } from '../../mongodb/models/friend'

import GJCrypto from '../../helpers/GJCrypto'
import GJHelpers from '../../helpers/GJHelpers'
import EPermissions from '../../helpers/EPermissions'

let path = `/${config.basePath}/getGJUserInfo20.php`
let required = ['targetAccountID']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const gjp = body.gjp
    const targetAccountID = body.targetAccountID
    const accountID = body.accountID

    if (accountID != 0 && gjp) {
        if (!await GJCrypto.gjpCheck(gjp, accountID)) {
            log.info(`${accountID}: incorrect GJP`)
            return -1
        }
    }

    const blocked = await BlockModel.findOne({ accountID1: targetAccountID, accountID2: accountID })

    if (blocked) {
        log.info(`${accountID} blocked by ${targetAccountID}`)
        return -1
    }

    const user = await UserModel.findOne({ accountID: body.targetAccountID })

    if (!user) {
        log.info(`${targetAccountID}: user not found`)
        return -1
    }

    let badge = await GJHelpers.getAccountPermission(accountID, EPermissions.badgeLevel)
    let reqsState = user.frS
    let msgState = user.mS
    let commentState = user.cS

    let friendState = 0

    if (accountID == targetAccountID) {
        let newFriendRequests = await FriendRequestModel.countDocuments({ toAccountID: accountID })
        let newMessages = await MessageModel.countDocuments({ recipientID: accountID, isUnread: true })
        let newFriends = await FriendModel.countDocuments({
            $or: [
                { accountID1: accountID, isUnread2: true },
                { accountID2: accountID, isUnread1: true }
            ]
        })

        var state = ':' + GJHelpers.jsonToRobtop({
            38: newMessages,
            39: newFriendRequests,
            40: newFriends
        })
    }
    else {
        let incomingRequests = await FriendRequestModel.findOne({
            fromAccountID: targetAccountID, toAccountID: accountID
        })
        if (incomingRequests) {
            friendState = 3
            var state = ':' + GJHelpers.jsonToRobtop({
                32: incomingRequests.requestID,
                35: incomingRequests.message,
                37: incomingRequests.uploadDate
            })
        }

        let outcomingRequests = await FriendRequestModel.countDocuments({
            toAccountID: targetAccountID, fromAccountID: accountID
        })
        if (outcomingRequests > 0) friendState = 4

        let friend = await FriendModel.countDocuments({
            $or: [
                { accountID1: accountID, accountID2: targetAccountID },
                { accountID2: accountID, accountID1: targetAccountID }
            ]
        })
        if (friend > 0) friendState = 1
    }

    let rank = await UserModel.countDocuments({ stars: { $gt: user.stars }, isBanned: false })

    log.info(`User ${targetAccountID} info received`)

    return GJHelpers.jsonToRobtop({
        1: user.userName,
        2: targetAccountID,
        3: user.stars,
        4: user.demons,
        8: user.isBanned ? 0 : user.creatorPoints,
        10: user.color1,
        11: user.color2,
        13: user.coins,
        16: targetAccountID,
        17: user.userCoins,
        18: msgState,
        19: reqsState,
        20: user.youtube || '',
        21: user.accIcon,
        22: user.accShip,
        23: user.accBall,
        24: user.accBird,
        25: user.accDart,
        26: user.accRobot,
        28: user.accGlow,
        29: 1, // idk
        30: user.isBanned ? 0 : rank + 1,
        31: friendState,
        43: user.accSpider,
        44: user.twitter || '',
        45: user.twitch || '',
        46: user.diamonds,
        47: user.accExplosion,
        49: badge,
        50: commentState
    }) + state
}

export { path, required, callback }