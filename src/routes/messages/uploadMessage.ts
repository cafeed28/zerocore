import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'
import { MessageModel } from '../../mongodb/models/message'
import { UserModel } from '../../mongodb/models/user'

import GJCrypto from '../../helpers/GJCrypto'
import { BlockModel } from '../../mongodb/models/block'
import { FriendModel } from '../../mongodb/models/friend'

let path = `/${config.basePath}/uploadGJMessage20.php`
let required = ['secret', 'accountID', 'gjp', 'subject', 'toAccountID', 'body']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const gjp = body.gjp
    let accountID = body.accountID
    let recipientID = body.toAccountID
    let subject = body.subject
    let msgbody = body.body

    if (accountID == recipientID) {
        log.info(`Cannot send message to ${recipientID}: trying to send message yourself`)
        return '-1'
    }

    if (!await GJCrypto.gjpCheck(gjp, accountID)) {
        log.info(`Cannot send message to ${recipientID}: incorrect GJP`)
        return '-1'
    }

    let isBlocked = await BlockModel.findOne({ accountID1: recipientID, accountID2: accountID })

    let sender = await UserModel.findOne({ accountID: accountID })
    let recipient = await UserModel.findOne({ accountID: recipientID })
    let mSOnly = recipient.mS

    let isFriend = await FriendModel.findOne({
        $or: [
            { accountID1: accountID, accountID2: recipientID },
            { accountID2: accountID, accountID1: recipientID }
        ]
    })

    if (mSOnly == 2) {
        log.info(`Cannot send message to ${recipientID}: recipient blocked messages`)
        return '-1'
    }

    if (!isBlocked && ((!mSOnly || mSOnly != 2) || !isFriend)) {
        await MessageModel.create({
            subject: subject,
            body: msgbody,
            senderID: accountID,
            recipientID: recipientID,
            userName: sender.userName,
            uploadDate: Math.round(Date.now() / 1000),
        })
    }
    else {
        if (isBlocked) log.info(`Cannot send message to ${recipientID}: recipient blocked you`)
        if (!isFriend && mSOnly == 1) log.info(`Cannot send message to ${recipientID}: recipient allowed only friends messages`)
        return '-1'
    }

    log.info(`Message to ${recipientID} sended`)
    return '1'
}

export { path, required, callback }