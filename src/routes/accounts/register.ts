import config from '../../config'
import log from '../../logger'

import { ExpressIncomingMessage, ExpressServerResponse } from '@opengalaxium/tinyhttp'
import { AccountModel } from '../../mongodb/models/account'

import bcrypt from 'bcrypt'

let path = `/${config.basePath}/accounts/registerGJAccount.php`
let required = ['userName', 'password', 'email']
let callback = async (req: ExpressIncomingMessage, res: ExpressServerResponse) => {
    const body = req.body

    const checkUser = await AccountModel.findOne({ userName: body.userName })

    if (checkUser) {
        log.info(`account ${body.userName} already exist`)
        return res.send('-2')
    } else {
        await AccountModel.create({
            userName: body.userName,
            password: await bcrypt.hash(body.password, 10),
            email: body.email
        })

        log.info(`account ${body.userName} created`)
        return res.send('1')
    }
}

export { path, required, callback }