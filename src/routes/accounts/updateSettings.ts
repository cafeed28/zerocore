import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'
import { UserModel } from '../../mongodb/models/user'

import GJCrypto from '../../helpers/GJCrypto'

let path = `/${config.basePath}/accounts/updateGJAccSettings20.php`
let required = ['gjp', 'accountID', 'mS', 'frS', 'cS', 'yt', 'twitter', 'twitch']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const gjp = body.gjp
    const accountID = body.accountID

    const mS = body.mS
    const frS = body.frS
    const cS = body.cS

    const youtube = body.yt
    const twitter = body.twitter
    const twitch = body.twitch

    log.debug(mS)
    log.debug(frS)
    log.debug(cS)

    if (!await GJCrypto.gjpCheck(gjp, accountID)) {
        log.info(`Account ${accountID}: incorrect GJP`)
        return '-1'
    }

    await UserModel.findOneAndUpdate({ accountID }, { mS, frS, cS, twitter, twitch, youtube })

    log.info(`Account ${accountID} updated a settings`)
    return '1'
}

export { path, required, callback }