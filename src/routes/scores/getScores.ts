import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'
import { FriendModel } from '../../mongodb/models/friend'
import { IUser, UserModel } from '../../mongodb/models/user'

import GJCrypto from '../../helpers/GJCrypto'
import GJHelpers from '../../helpers/GJHelpers'

let path = `/${config.basePath}/getGJScores20.php`
let required = ['secret', 'accountID', 'gjp', 'type']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    let accountID = body.accountID
    const gjp = body.gjp
    const type = body.type

    if (accountID) {
        if (!await GJCrypto.gjpCheck(gjp, accountID)) {
            log.info(`Cannot recieve scores: incorrect GJP`)
            return '-1'
        }
    }
    else {
        accountID = body.udid
        if (!isNaN(accountID)) {
            return '-1'
        }
    }

    if (type == 'friends') {
        const friends = await FriendModel.find({
            $or: [
                { accountID1: accountID },
                { accountID2: accountID },
            ]
        })

        let friendsIDs = []
        friendsIDs.push(accountID)

        for (let friend of friends) {
            let accID = friend.accountID2 == accountID ? friend.accountID1 : friend.accountID2
            friendsIDs.push(accID)
        }

        const users = await UserModel.find({
            accountID: { $in: friendsIDs }
        }).sort({ stars: -1 })

        let result = []

        let i = 0
        for (let user of users) {
            i++

            result.push(GJHelpers.jsonToRobtop({
                1: user.userName,
                2: user.accountID,
                3: user.stars,
                4: user.demons,
                6: i,
                7: user.accountID,
                8: Math.floor(user.creatorPoints),
                9: user.icon,
                10: user.color1,
                11: user.color2,
                13: user.coins,
                14: user.iconType,
                15: user.special,
                16: user.accountID,
                17: user.userCoins,
                46: user.diamonds
            }))
        }

        log.debug(result)
        log.info(`Scores recieved`)
        return result.join('|')
    }
    else {
        if (type == 'top') {
            var users = await UserModel.find({
                isBanned: false,
                stars: { $gt: 0 }
            }).sort({ stars: -1 }).limit(100)
        }
        else if (type == 'creators') {
            var users = await UserModel.find({
                isBanned: false,
                creatorPoints: { $gt: 0 }
            }).sort({ creatorPoints: -1 }).limit(100)
        }
        else if (type == 'relative') {
            var user = await UserModel.findOne({
                isBanned: false,
                accountID: accountID
            })
            let stars = user.stars

            if (body.count) var count = Math.floor(parseInt(body.count) / 2)
            else var count = Math.floor(25)

            // Mongoose Union :overdrive_ebalo:
            let users1 = await UserModel.find({
                stars: { $lte: stars },
                isBanned: false
            }).sort({ stars: -1 })

            let users2 = await UserModel.find({
                stars: { $gte: stars },
                isBanned: false
            }).sort({ stars: 1 })

            var users = users1
            for (let user of users2)
                users.push(user)

            let compare = (a: IUser, b: IUser) => {
                if (a.stars > b.stars) return -1
                if (a.stars < b.stars) return 1
                return 0
            }

            users = users.sort(compare)

            // remove duplicates
            users = users.reduce((unique, o) => {
                if (!unique.some((obj: IUser) => obj.accountID == o.accountID)) {
                    unique.push(o)
                }
                return unique
            }, [])

            console.log(users)
        }

        let result = []

        let i = 0
        for (let user of users) {
            i++

            result.push(GJHelpers.jsonToRobtop({
                1: user.userName,
                2: user.accountID,
                3: user.stars,
                4: user.demons,
                6: i,
                7: user.accountID,
                8: Math.floor(user.creatorPoints),
                9: user.icon,
                10: user.color1,
                11: user.color2,
                13: user.coins,
                14: user.iconType,
                15: user.special,
                16: user.accountID,
                17: user.userCoins,
                46: user.diamonds
            }))
        }

        log.debug(result)
        log.info(`Scores recieved`)
        return result.join('|')
    }
}

export { path, required, callback }