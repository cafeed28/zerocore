import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'
import { LevelModel } from '../../mongodb/models/level'
import { CommentModel } from '../../mongodb/models/comment'
import { PostModel } from '../../mongodb/models/post'
import { ActionModel } from '../../mongodb/models/action'

import GJCrypto from '../../helpers/GJCrypto'
import EActions from '../../helpers/EActions'

let path = `/${config.basePath}/likeGJItem211.php`
let required = ['gjp', 'accountID', 'itemID', 'like', 'type']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const gjp = body.gjp
    const accountID = body.accountID
    const type = body.type
    const itemID = body.itemID

    if (!await GJCrypto.gjpCheck(gjp, accountID)) {
        log.info(`Cannot like item ${itemID}<${type}>: invalid GJP`)
        return '-1'
    }

    let item

    if (type == 1) {
        item = await LevelModel.findOne({ levelID: itemID })
    } else if (type == 2) {
        item = await CommentModel.findOne({ commentID: itemID })
    } else if (type == 3) {
        item = await PostModel.findOne({ postID: itemID })
    } else {
        log.info(`Cannot like item ${itemID}<${type}>: unknown type`)
        return '-1'
    }

    if (!item) {
        log.info(`Cannot like item ${itemID}<${type}>: item not found`)
        return '-1'
    }

    let likes = item.likes
    if (body.like == 1) likes++
    else likes--

    await item.updateOne({ likes })

    await ActionModel.create({
        actionType: EActions.itemLike,
        IP: req.socket.remoteAddress,
        timestamp: Date.now(),
        itemID: itemID,
        itemType: type
    })

    log.info(`Liked item ${itemID}<${type}>`)
    return '1'
}

export { path, required, callback }