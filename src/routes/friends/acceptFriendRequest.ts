import config from '../../config'
import log from '../../logger'
import dayjs from 'dayjs'

import { Request, Response } from 'polka'
import { FriendModel } from '../../mongodb/models/friend'
import { FriendRequestModel } from '../../mongodb/models/friendRequest'

import GJCrypto from '../../helpers/GJCrypto'

let path = `/${config.basePath}/acceptGJFriendRequest20.php`
let required = ['gjp', 'accountID', 'targetAccountID', 'requestID', 'secret']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const gjp = body.gjp
    const accountID = body.accountID
    const toAccountID = body.targetAccountID
    const requestID = body.requestID

    if (!await GJCrypto.gjpCheck(gjp, accountID)) {
        log.info(`Cannot accept friend request ${requestID}: incorrect GJP`)
        return '-1'
    }

    await FriendRequestModel.deleteOne({
        requestID: requestID
    })

    FriendModel.create({
        accountID1: accountID,
        accountID2: toAccountID
    })

    log.info(`Friend request ${requestID} accepted`)
    return '1'
}

export { path, required, callback }