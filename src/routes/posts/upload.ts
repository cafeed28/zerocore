import config from '../../config'
import log from '../../logger'

import { ExpressIncomingMessage, ExpressServerResponse } from '@opengalaxium/tinyhttp'
import { PostModel } from '../../mongodb/models/post'

import GJCrypto from '../../helpers/GJCrypto'

let path = `/${config.basePath}/uploadGJAccComment20.php`
let required = ['gjp', 'userName', 'commentID', 'accountID']
let callback = async (req: ExpressIncomingMessage, res: ExpressServerResponse) => {
    const body = req.body

    const gjp = body.gjp
    const userName = body.userName
    const post = body.comment
    const accountID = body.accountID

    if (await GJCrypto.gjpCheck(gjp, accountID)) {
        await PostModel.create({
            userName, accountID, post,
            uploadDate: Math.round(Date.now() / 1000),
        })

        log.info(`${userName} created a post`)
        return res.send('1')
    } else {
        log.info(`${userName}: incorrect GJP`)
        return res.send('-1')
    }
}

export { path, required, callback }