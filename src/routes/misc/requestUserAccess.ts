import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'

import GJCrypto from '../../helpers/GJCrypto'
import GJHelpers from '../../helpers/GJHelpers'
import EPermissions from '../../helpers/EPermissions'

let path = `/${config.basePath}/requestUserAccess.php`
let required = ['accountID', 'gjp', 'secret']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const accountID = body.accountID
    const gjp = body.gjp

    if (!await GJCrypto.gjpCheck(gjp, accountID)) {
        log.info(`User access for account ${accountID} not allowed: incorrect GJP`)
        return '-1'
    }

    if (await GJHelpers.getAccountPermission(accountID, EPermissions.badgeLevel) > 0) {
        const permission = await GJHelpers.getAccountPermission(accountID, EPermissions.badgeLevel)
        log.info(`User access for account ${accountID} allowed`)
        return permission.toString()
    }
    else {
        log.info(`User access for account ${accountID} not allowed: access denied`)
        return '-1'
    }
}

export { path, required, callback }