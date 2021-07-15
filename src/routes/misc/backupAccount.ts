import config from '../../config'
import log from '../../logger'
import { promises as fs } from 'fs'
import zlib from 'node-gzip'

import { Request, Response } from 'polka'
import { AccountModel } from '../../mongodb/models/account'
import { UserModel } from '../../mongodb/models/user'

import GJHelpers from '../../helpers/GJHelpers'

let path = `/${config.basePath}/getAccountURL.php/database/accounts/backupGJAccountNew.php`
let required = ['userName', 'password']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    let saveData = body.saveData
    const userName = body.userName
    const password = body.password
    const accountID = (await AccountModel.findOne({ userName: userName })).accountID

    if (!await GJHelpers.isValid(userName, password)) {
        log.info(`Account ${userName} backup error: incorrect GJP`)
        return '-1'
    }

    let saveDataArr = saveData.split(';')
    let saveDataBuff = Buffer.from(saveDataArr[0].replace(/-/g, '+').replace(/_/g, '/'), 'base64')

    saveData = Buffer.from(await zlib.ungzip(saveDataBuff)).toString('ascii')

    let orbs = saveData.split('</s><k>14</k><s>')[1].split('</s>')[0]
    let levels = saveData.split('<k>GS_value</k>')[1].split('</s><k>4</k><s>')[1].split('</s>')[0]

    saveData = Buffer.from(await zlib.gzip(saveData)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_')
    saveData = saveData + ';' + saveDataArr[1]

    try {
        await fs.mkdir(`data/levels`, { recursive: true })
        await fs.writeFile(`data/saves/${accountID}`, saveData)
    }
    catch (err) {
        log.error(`Account ${userName} backup error`)
        log.error(err.stack)
        return '-1'
    }
    await UserModel.updateOne({ accountID: accountID }, { orbs: orbs, completedLevels: levels })

    log.info(`Account ${userName} backup success`)
    return '1'
}

export { path, required, callback }