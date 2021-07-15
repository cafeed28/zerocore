import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'

import GJCrypto from '../../helpers/GJCrypto'
import GJHelpers from '../../helpers/GJHelpers'
import EPermissions from '../../helpers/EPermissions'

let path = `/${config.basePath}/rateGJStars.php`
let required = ['accountID', 'gjp', 'secret']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const gjp = body.gjp
    const levelID = body.levelID
    const accountID = body.accountID
    const stars = body.stars

    if (!await GJCrypto.gjpCheck(gjp, accountID)) {
        log.info(`Cannot rate level ${levelID} from account ${accountID}: incorrect GJP`)
        return '-1'
    }

    const permission = await GJHelpers.checkPermission(accountID, EPermissions.rateLevelStar)
    if (permission) {
        let diff: any = GJHelpers.getDiffFromStars(stars)

        await GJHelpers.rateLevel(accountID, levelID, stars, diff['diff'], diff['auto'], diff['demon'])
        await GJHelpers.verifyCoinsLevel(accountID, levelID, true)

        log.info(`Level ${levelID} from account ${accountID} rated`)
        return '1'
    }
    else {
        log.info(`Cannot rate level ${levelID} from account ${accountID}: access denied`)
        return '-1'
    }
}

export { path, required, callback }