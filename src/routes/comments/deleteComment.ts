import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'
import { CommentModel } from '../../mongodb/models/comment'

import GJCrypto from '../../helpers/GJCrypto'

let path = `/${config.basePath}/deleteGJComment20.php`
let required = ['gjp', 'commentID', 'levelID', 'accountID', 'secret']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const gjp = body.gjp
    const levelID = body.levelID
    const accountID = body.accountID
    const commentID = body.commentID

    if (!await GJCrypto.gjpCheck(gjp, accountID)) {
        log.info(`Cannot delete comment on level ${levelID}: incorrect GJP`)
        return '-1'
    }

    const comment = await CommentModel.deleteOne({
        commentID: commentID
    })

    if (comment.deletedCount == 0) {
        log.info(`Cannot delete comment on level ${levelID}: not found`)
        return '-1'
    } else {
        log.info(`Comment on level ${levelID} deleted`)
        return '1'
    }
}

export { path, required, callback }