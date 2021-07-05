import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'
import { AccountModel } from '../../mongodb/models/account'

import bcrypt from 'bcrypt'
import { ActionModel } from '../../mongodb/models/action'
import EActions from '../../helpers/EActions'

let path = `/${config.basePath}/accounts/loginGJAccount.php`
let required = ['userName', 'password']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const account = await AccountModel.findOne({ userName: body.userName })

    if (!account) {
        log.info(`Account ${body.userName} not found`)
        return '-1'
    }
    if (account.isBanned) {
        log.info(`Account ${body.userName} disabled`)
        return '-12'
    }

    if (await bcrypt.compare(body.password, account.password)) {
        await ActionModel.create({
            actionType: EActions.accountLogin,
            IP: req.socket.remoteAddress,
            timestamp: Date.now(),
            accountID: account.accountID
        })

        log.info(`Logged in ${body.userName}`)
        return `${account.accountID},${account.accountID}`
    } else {
        log.info(`Account ${body.userName}: incorrect password`)
        return '-1'
        // -13 Already linked to different Steam account
        // replace to
        // Incorrect password
    }
}

export { path, required, callback }