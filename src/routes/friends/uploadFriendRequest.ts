import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'
import { BlockModel } from '../../mongodb/models/block'
import { FriendRequestModel } from '../../mongodb/models/friendRequest'
import { UserModel } from '../../mongodb/models/user'

import GJCrypto from '../../helpers/GJCrypto'

let path = `/${config.basePath}/blockGJUser20.php`
let required = ['gjp', 'accountID', 'toAccountID', 'secret']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const gjp = body.gjp
    const accountID = body.accountID
    const toAccountID = body.toAccountID
    const message = body.comment

    if (!await GJCrypto.gjpCheck(gjp, accountID)) {
        log.info(`Cannot send friend request to ${toAccountID}: incorrect GJP`)
        return '-1'
    }

    const user = await UserModel.findOne({ accountID: toAccountID })
    const blocked = await BlockModel.findOne({ accountID1: toAccountID, accountID2: accountID })

    if (user.frS == 1 || blocked) {
        log.info(`Cannot send friend request to ${toAccountID}: user blocked`)
        return '-1'
    }

    FriendRequestModel.create({
        requestID: (await FriendRequestModel.find({}).sort({ _id: -1 }).limit(1))[0].requestID + 1,
        fromAccountID: accountID,
        toAccountID: toAccountID,
        message: message,
        uploadDate: Math.round(new Date().getTime() / 1000)
    })

    log.info(`Friend request from ${accountID} to ${toAccountID} sended`)
    return '1'
}

export { path, required, callback }