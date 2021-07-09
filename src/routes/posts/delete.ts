import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'
import { PostModel } from '../../mongodb/models/post'

import GJCrypto from '../../helpers/GJCrypto'

let path = `/${config.basePath}/deleteGJAccComment20.php`
let required = ['gjp', 'commentID', 'accountID']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const gjp = body.gjp
    const accountID = body.accountID
    const postID = body.commentID

    if (!await GJCrypto.gjpCheck(gjp, accountID)) {
        log.info(`Account ${accountID}: incorrect GJP`)
        return '-1'
    }

    const post = await PostModel.deleteOne({ postID })

    if (post.deletedCount == 0) {
        log.info(`Post ${postID}: not found`)
        return '-1'
    } else {
        log.info(`Post ${postID} deleted`)
        return '1'
    }
}

export { path, required, callback }