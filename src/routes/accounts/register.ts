import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'
import { createAccount } from '../../mongodb/models/account'

import bcrypt from 'bcrypt'

let path = `/${config.basePath}/accounts/registerGJAccount.php`
let required = ['userName', 'password', 'email']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    let result = await createAccount(body.userName, body.password, body.email)

    if (result.code == 0) {
        log.info(`Account ${body.userName} created`)
        return '1'
    }
    else if (result.code == 1) {
        log.info(`Unknown error while creating account ${body.userName}`)
        return '-1'
    }
    else if (result.code == 2) {
        log.info(`Account ${body.userName} already exist`)
        return '-2'
    }
}

export { path, required, callback }