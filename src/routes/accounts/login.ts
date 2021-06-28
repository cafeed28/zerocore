import config from '../../config'
import log from '../../logger'

import { ExpressIncomingMessage, ExpressServerResponse } from '@opengalaxium/tinyhttp'
import { AccountModel } from '../../mongodb/models/account'

import bcrypt from 'bcrypt'
import { ActionModel } from '../../mongodb/models/action'
import EActions from '../../helpers/EActions'

let path = `/${config.basePath}/accounts/loginGJAccount.php`
let required = ['userName', 'password']
let callback = async (req: ExpressIncomingMessage, res: ExpressServerResponse) => {
    const body = req.body

    const account = await AccountModel.findOne({ userName: body.userName })

    if (!account) {
        log.info(`account ${body.userName} not found`)
        return -1
    } else {
        if (await bcrypt.compare(body.password, account.password)) {
            await ActionModel.create({
                actionType: EActions.accountLogin,
                IP: req.socket.remoteAddress,
                timestamp: Date.now(),
                accountID: account.accountID
            })

            log.info(`logged in ${body.userName}`)
            return `${account.accountID},${account.accountID}`
        } else {
            log.info(`account ${body.userName}: incorrect password`)
            return -12
        }
    }
}

export { path, required, callback }