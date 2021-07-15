import config from '../../config'
import log from '../../logger'
import dayjs from 'dayjs'

import { Request, Response } from 'polka'
import { FriendRequestModel } from '../../mongodb/models/friendRequest'
import { UserModel } from '../../mongodb/models/user'

import GJHelpers from '../../helpers/GJHelpers'

let path = `/${config.basePath}/getGJFriendRequests20.php`
let required = ['accountID', 'page']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const accountID = body.accountID
    const page = body.page
    const getSent = body.getSent || 0

    let requestsList = []

    let requests
    if (getSent == 1) {
        requests = await FriendRequestModel.find({ fromAccountID: accountID }).skip(page * 10).limit(10)
    } else {
        requests = await FriendRequestModel.find({ toAccountID: accountID }).skip(page * 10).limit(10)
    }

    if (!requests) {
        log.info(`Friend requests to account ${accountID} recieved`)
        return '-1'
    }

    for (const request of requests) {
        let dateAgo = dayjs(request.uploadDate * 1000).fromNow(true)

        const user = await UserModel.findOne({
            accountID: getSent == 1 ? request.toAccountID : request.fromAccountID
        })

        requestsList.push(GJHelpers.jsonToRobtop({
            1: user.userName,
            2: user.accountID,
            3: user.accIcon,
            10: user.color1,
            11: user.color2,
            14: user.iconType,
            15: user.special,
            17: user.userCoins,
            16: user.accountID,
            32: request.requestID,
            35: request.message,
            37: dateAgo,
            41: request.isUnread
        }))
    }

    log.info(`Friend requests to account ${accountID} recieved`)
    return requestsList.join('|') + `#${requests.length}:${page * 10}:10`
}

export { path, required, callback }