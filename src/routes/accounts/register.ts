import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'
import { AccountModel } from '../../mongodb/models/account'

import bcrypt from 'bcrypt'

let path = `/${config.basePath}/accounts/registerGJAccount.php`
let required = ['userName', 'password', 'email']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const checkUser = await AccountModel.findOne({ userName: body.userName })

    if (checkUser) {
        log.info(`Account ${body.userName} already exist`)
        return '-2'
    }

    await AccountModel.create({
        userName: body.userName,
        password: await bcrypt.hash(body.password, 10),
        email: body.email
    })

    log.info(`Account ${body.userName} created`)
    return '1'
}

export { path, required, callback }