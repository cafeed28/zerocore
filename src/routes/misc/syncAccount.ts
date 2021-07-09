import config from '../../config'
import log from '../../logger'
import { promises as fs } from 'fs'

import { Request, Response } from 'polka'
import { AccountModel } from '../../mongodb/models/account'

import GJHelpers from '../../helpers/GJHelpers'

let path = `/${config.basePath}/getAccountURL.php/database/accounts/syncGJAccountNew.php`
let required = ['userName', 'password']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const userName = body.userName
    const password = body.password
    const accountID = (await AccountModel.findOne({ userName: userName })).accountID

    if (!await GJHelpers.isValid(userName, password)) {
        log.info(`Account ${userName} sync error: incorrect GJP`)
        return '-1'
    }

    let saveData

    try {
        saveData = await fs.readFile(`data/saves/${accountID}`, 'utf8')
    }
    catch (err) {
        if (err.code == 'ENOENT') {
            log.error(`Account ${userName} sync error: backup not found`)
            return '-1'
        }

        log.error(`Account ${userName} sync error`)
        log.error(err.stack)
        return '-1'
    }

    log.info(`Account ${userName} sync success`)
    return `${saveData};21;30;a;a`
}

export { path, required, callback }