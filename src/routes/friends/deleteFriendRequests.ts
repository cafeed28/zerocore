import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'
import { BlockModel } from '../../mongodb/models/block'
import { FriendRequestModel } from '../../mongodb/models/friendRequest'
import { UserModel } from '../../mongodb/models/user'

import GJCrypto from '../../helpers/GJCrypto'

let path = `/${config.basePath}/deleteGJFriendRequests20.php`
let required = ['gjp', 'accountID', 'targetAccountID', 'isSender', 'secret']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const gjp = body.gjp
    const accountID = body.accountID
    const toAccountID = body.targetAccountID
    const isSender = body.isSender

    if (await GJCrypto.gjpCheck(gjp, accountID)) {
        if (isSender == 0) {
            await FriendRequestModel.deleteOne({
                fromAccountID: toAccountID,
                toAccountID: accountID
            })
        } else if (isSender == 1) {
            await FriendRequestModel.deleteOne({
                fromAccountID: accountID,
                toAccountID: toAccountID
            })
        } else {
            log.info(`Cannot delete friend request from ${accountID} to ${toAccountID}: unknown error`)
            return '-1'
        }

        log.info(`Friend request from ${accountID} to ${toAccountID} deleted`)
        return '1'
    } else {
        log.info(`Cannot delete friend request from ${accountID} to ${toAccountID}: incorrect GJP`)
        return '-1'
    }
}

export { path, required, callback }