import config from '../../config'
import log from '../../logger'
import dayjs from 'dayjs'

import { Request, Response } from 'polka'
import { MessageModel } from '../../mongodb/models/message'

import GJHelpers from '../../helpers/GJHelpers'
import GJCrypto from '../../helpers/GJCrypto'

let path = `/${config.basePath}/deleteGJMessages20.php`
let required = ['messageID', 'accountID', 'gjp']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const gjp = body.gjp
    const accountID = body.accountID
    let messageID = body.messageID
    let messages = body.messages

    if (!await GJCrypto.gjpCheck(gjp, accountID)) {
        log.info(`Cannot delete messages ${messages}: incorrect GJP`)
        return '-1'
    }

    if (messages) {
        messages = messages.replace(/[^0-9,]/, '').split(',')
        var limit = 10
    }
    else {
        messages = messageID
        var limit = 1
    }

    await MessageModel.find({
        messageID: {
            $in: messages
        },
        senderID: accountID
    }).limit(limit).deleteMany()

    await MessageModel.find({
        messageID: {
            $in: messages
        },
        recipientID: accountID
    }).limit(limit).deleteMany()

    log.info(`Messages ${messages} deleted`)
    return '1'
}

export { path, required, callback }