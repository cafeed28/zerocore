import config from '../../config'
import log from '../../logger'
import dayjs from 'dayjs'

import { Request, Response } from 'polka'
import { MessageModel } from '../../mongodb/models/message'
import { UserModel } from '../../mongodb/models/user'

import GJHelpers from '../../helpers/GJHelpers'
import GJCrypto from '../../helpers/GJCrypto'

let path = `/${config.basePath}/getGJMessages20.php`
let required = ['accountID', 'gjp', 'page']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const gjp = body.gjp
    let accountID = body.accountID
    const page = body.page

    let getSent = body.getSent
    let offset = page * 10

    let messagesList = []

    if (!await GJCrypto.gjpCheck(gjp, accountID)) {
        log.info(`Cannot recieve messages to account ${accountID}: incorrect GJP`)
        return '1'
    }

    if (getSent != 1) {
        var messages = await MessageModel
            .find({ recipientID: accountID })
            .sort({ messageID: -1 })
            .skip(offset)
            .limit(10)

        var count = await MessageModel.countDocuments({ recipientID: accountID })
        getSent = 0
    } else {
        var messages = await MessageModel
            .find({ senderID: accountID })
            .sort({ messageID: -1 })
            .skip(offset)
            .limit(10)

        var count = await MessageModel.countDocuments({ senderID: accountID })
        getSent = 1
    }

    if (count == 0) {
        log.info(`Messages to account ${accountID} recieved`)
        return res.send('-2')
    }

    for (const message of messages) {
        if (!message.messageID) continue

        if (getSent == 1) accountID = message.recipientID
        else accountID = message.senderID

        let user = await UserModel.findOne({ accountID: accountID })

        let uploadDate = moment(message.uploadDate * 1000).fromNow(true)

        // todo: use helper (i am too lzay now)
        messagesList.push(`6:${user.userName}:3:${user.accountID}:2:${user.accountID}:1:${message.messageID}:4:${message.subject}:8:${!+message.isUnread}:9:${getSent}:7:${uploadDate}`)
    }

    log.info(`Messages to account ${accountID} recieved`)
    return res.send(`${messagesList.join('|')}#${count}:${offset}:10`)
}

export { path, required, callback }