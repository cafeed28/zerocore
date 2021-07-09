import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'
import { UserModel } from '../../mongodb/models/user'

import GJCrypto from '../../helpers/GJCrypto'

let path = `/${config.basePath}/updateGJAccSettings20.php`
let required = ['gjp', 'accountID', 'mS', 'frS', 'cS', 'yt', 'twitter', 'twitch']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const gjp = body.gjp
    const accountID = body.accountID

    const mS = body.mS // messages from (0 - all, 1 - friends, 2 - none)
    const frS = body.frS // friend requests from (0 - all, 1 - none)
    const cS = body.cS // show comment history to (0 - all, 1 - friends, 2 - none)

    const youtube = body.yt
    const twitter = body.twitter
    const twitch = body.twitch

    if (!await GJCrypto.gjpCheck(gjp, accountID)) {
        log.info(`Account ${accountID}: incorrect GJP`)
        return '-1'
    }

    await UserModel.findOneAndUpdate({ accountID }, { mS, frS, cS, twitter, twitch, youtube })

    log.info(`Account ${accountID} updated a settings`)
    return '1'
}

export { path, required, callback }