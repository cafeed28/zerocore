import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'
import { FriendModel } from '../../mongodb/models/friend'
import { BlockModel } from '../../mongodb/models/block'
import { FriendRequestModel } from '../../mongodb/models/friendRequest'

import GJCrypto from '../../helpers/GJCrypto'

let path = `/${config.basePath}/blockGJUser20.php`
let required = ['gjp', 'accountID', 'targetAccountID', 'requestID', 'secret']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const gjp = body.gjp
    const accountID = body.accountID
    const toAccountID = body.targetAccountID

    if (!await GJCrypto.gjpCheck(gjp, accountID)) {
        log.info(`Cannot block user ${toAccountID}: incorrect GJP`)
        return '-1'
    }

    BlockModel.create({
        accountID1: accountID,
        accountID2: toAccountID
    })

    await FriendModel.deleteOne({
        fromAccountID: accountID,
        toAccountID: toAccountID
    })

    await FriendRequestModel.deleteOne({
        fromAccountID: accountID,
        toAccountID: toAccountID
    })

    log.info(`User ${accountID} blocked ${toAccountID}: incorrect GJP`)
    return '1'
}

export { path, required, callback }