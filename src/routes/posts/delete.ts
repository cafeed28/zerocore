import config from '../../config'
import log from '../../logger'

import { ExpressIncomingMessage, ExpressServerResponse } from '@opengalaxium/tinyhttp'
import { PostModel } from '../../mongodb/models/post'

import GJCrypto from '../../helpers/GJCrypto'

let path = `/${config.basePath}/deleteGJAccComment20.php`
let required = ['gjp', 'comment', 'accountID']
let callback = async (req: ExpressIncomingMessage, res: ExpressServerResponse) => {
    const body = req.body

    const gjp = body.gjp
    const accountID = body.accountID
    const postID = body.commentID

    if (await GJCrypto.gjpCheck(gjp, accountID)) {
        const post = await PostModel.deleteOne({ postID })

        if (post.deletedCount == 0) {
            log.info(`${postID}: not found`)
            return res.send('-1')
        } else {
            log.info(`${postID} deleted`)
            return res.send('1')
        }
    } else {
        log.info(`${accountID}: incorrect GJP`)
        return res.send('-1')
    }
}

export { path, required, callback }