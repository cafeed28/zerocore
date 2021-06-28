import config from '../../config'
import log from '../../logger'

import { ExpressIncomingMessage, ExpressServerResponse } from '@opengalaxium/tinyhttp'
import { UserModel } from '../../mongodb/models/user'

import GJCrypto from '../../helpers/GJCrypto'

let path = `/${config.basePath}/accounts/updateGJAccSettings20.php`
let required = ['gjp', 'accountID', 'mS', 'frS', 'cS', 'yt', 'twitter', 'twitch']
let callback = async (req: ExpressIncomingMessage, res: ExpressServerResponse) => {
    const body = req.body

    const gjp = body.gjp
    const accountID = body.accountID
    const mS = body.mS
    const frS = body.frS
    const cS = body.cS
    const yt = body.yt
    const twitter = body.twitter
    const twitch = body.twitch

    if (await GJCrypto.gjpCheck(gjp, accountID)) {
        await UserModel.findOneAndUpdate({ accountID }, {
            mS, frS, cS, twitter, twitch,
            youtube: yt
        })

        log.info(`${accountID} updated a settings`)
        return res.send('1')
    } else {
        log.info(`${accountID}: incorrect GJP`)
        return res.send('-1')
    }
}

export { path, required, callback }