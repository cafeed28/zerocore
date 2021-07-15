import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'
import { FriendRequestModel } from '../../mongodb/models/friendRequest'
import GJCrypto from '../../helpers/GJCrypto'

let path = `/${config.basePath}/readGJFriendRequest20.php`
let required = ['gjp', 'accountID', 'requestID', 'secret']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const gjp = body.gjp
    const accountID = body.accountID
    const requestID = body.requestID

    if (!await GJCrypto.gjpCheck(gjp, accountID)) {
        log.info(`Cannot read friend request ${requestID}: incorrect GJP`)
        return '-1'
    }

    await FriendRequestModel.findOneAndUpdate({ requestID }, { isUnread: 0 })
    log.info(`Friend request ${requestID} readed`)
    return '1'
}

export { path, required, callback }