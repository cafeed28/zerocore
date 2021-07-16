import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'
import { AccountModel } from '../../mongodb/models/account'

import bcrypt from 'bcrypt'

let path = `/${config.basePath}/accounts/registerGJAccount.php`
let required = ['userName', 'password', 'email']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const userName = body.userName
    const password = body.password
    const email = body.email

    try {
        await AccountModel.create({ userName, password: await bcrypt.hash(password, 10), email })
    }
    catch (err) {
        if (err.name === 'ValidationError') {
            if (err.message.includes('userName')) {
                log.info(`Account ${body.userName} already exist`)
                return '-2'
            }
            if (err.message.includes('email')) {
                log.info(`Email ${body.email} already registred`)
                return '-2'
            }
        }

        log.error(`Unknown error while creating account ${body.userName}`)
        log.error(err)
        return '-1'
    }

    log.info(`Account ${body.userName} created`)
    return '1'
}

export { path, required, callback }