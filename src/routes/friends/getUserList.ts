import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'
import { BlockModel, IBlock } from '../../mongodb/models/block'
import { FriendModel, IFriend } from '../../mongodb/models/friend'
import { UserModel } from '../../mongodb/models/user'

import GJHelpers from '../../helpers/GJHelpers'
import GJCrypto from '../../helpers/GJCrypto'

let path = `/${config.basePath}/getGJUserList20.php`
let required = ['gjp', 'accountID', 'type']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const gjp = body.gjp
    const accountID = body.accountID
    const type = body.type

    if (await GJCrypto.gjpCheck(gjp, accountID)) {
        log.info(`Cannot recieve userlist of type ${type}: incorrect GJP`)
        return '-1'
    }

    let list: IFriend[] | IBlock[] = []

    if (type == 0) {
        list = await FriendModel.find({
            $or: [{
                accountID1: parseInt(accountID)
            }, {
                accountID2: parseInt(accountID)
            }]
        })

    } else if (type == 1) {
        list = await BlockModel.find({
            accountID1: accountID
        })
    }

    if (list.length == 0) {
        log.info(`Userlist of type ${type} recieved`)
        return '-2'
    }

    let usersIDs: number[] = []
    let isUnread: boolean[] = []
    list.map((item: IBlock | IFriend) => {
        let user = item.accountID1 != accountID ? item.accountID1 : item.accountID2
        isUnread[user] = item.accountID1 != accountID ? item.isUnread1 : item.isUnread2

        usersIDs.push(user)
    })

    const users = await UserModel.find().where('accountID').in(usersIDs)

    let usersList: string[] = []
    users.map(user => {
        usersList.push(GJHelpers.jsonToRobtop({
            1: user.userName,
            2: user.accountID,
            9: user.icon,
            10: user.color1,
            11: user.color2,
            14: user.iconType,
            15: user.special,
            16: user.accountID,
            17: user.userCoins,
            18: 0,
            41: +isUnread[user.accountID],
        }))
    })

    if (type == 0) {
        await FriendModel.updateMany({ accountID2: accountID }, { isUnread1: false })
        await FriendModel.updateMany({ accountID1: accountID }, { isUnread2: false })
    }

    log.info(`Userlist of type ${type} recieved`)
    return usersList.join('|')
}

export { path, required, callback }