import config from '../../config'
import log from '../../logger'
import dayjs from 'dayjs'

import { Request, Response } from 'polka'
import { MessageModel } from '../../mongodb/models/message'
import { UserModel } from '../../mongodb/models/user'

import GJHelpers from '../../helpers/GJHelpers'
import GJCrypto from '../../helpers/GJCrypto'

let path = `/${config.basePath}/downloadGJMessage20.php`
let required = ['messageID', 'accountID', 'gjp']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const gjp = body.gjp
    let accountID = body.accountID
    let messageID = body.messageID
    let isSender = body.isSender || 0

    if (!await GJCrypto.gjpCheck(gjp, accountID)) {
        log.info(`Cannot download message ${messageID}: incorrect GJP`)
        return '-1'
    }

    let message = await MessageModel.findOne({ messageID })

    if (!message) {
        log.info(`Cannot download message ${messageID}: message not found`)
        return '-1'
    }

    if (isSender == 0) {
        await MessageModel.updateOne({
            messageID: messageID
        }, { isUnread: false })

        accountID = message.senderID
    } else if (isSender == 1) {
        accountID = message.recipientID
    }

    let user = await UserModel.findOne({ accountID: accountID })

    let uploadDate = dayjs(message.uploadDate * 1000).fromNow(true)

    const response = GJHelpers.jsonToRobtop({
        1: message.messageID,
        2: user.accountID,
        3: user.accountID,
        4: message.subject,
        5: message.body,
        6: user.userName,
        7: uploadDate,
        8: !+message.isUnread,
        9: isSender
    })

    log.debug(response)
    log.info(`Message ${messageID} downloaded`)
    return response
}

export { path, required, callback }