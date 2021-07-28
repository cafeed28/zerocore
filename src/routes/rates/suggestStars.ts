import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'
import { GauntletModel } from '../../mongodb/models/gauntlet'

import GJCrypto from '../../helpers/GJCrypto'
import GJHelpers from '../../helpers/GJHelpers'
import EPermissions from '../../helpers/EPermissions'

let path = `/${config.basePath}/suggestGJStars20.php`
let required = ['secret', 'gjp', 'levelID', 'accountID']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const gjp = body.gjp
    const levelID = body.levelID
    const accountID = body.accountID
    const stars = body.stars
    const feature = body.feature

    if (!await GJCrypto.gjpCheck(gjp, accountID)) {
        log.info(`Cannot rate level ${levelID} from account ${accountID}: invalid GJP`)
        return '-2'
    }

    if (await GJHelpers.checkPermission(accountID, EPermissions.rateLevelStar)) {
        let diff: any = GJHelpers.getDiffFromStars(stars)

        await GJHelpers.rateLevel(accountID, levelID, stars, diff['diff'], diff['auto'], diff['demon'])
        await GJHelpers.verifyCoinsLevel(accountID, levelID, true)

        if (await GJHelpers.checkPermission(accountID, EPermissions.rateLevelFeatureEpic))
            await GJHelpers.featureLevel(accountID, levelID, feature)

        log.info(`Level ${levelID} from account ${accountID} rated`)
        return '1'
    }
    else {
        log.info(`Cannot rate level ${levelID} from account ${accountID}: access denied`)
        return '-2'
    }
}

export { path, required, callback }