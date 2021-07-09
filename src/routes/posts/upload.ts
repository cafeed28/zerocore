import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'
import { PostModel } from '../../mongodb/models/post'

import GJCrypto from '../../helpers/GJCrypto'

let path = `/${config.basePath}/uploadGJAccComment20.php`
let required = ['gjp', 'userName', 'comment', 'accountID']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const gjp = body.gjp
    const userName = body.userName
    const post = body.comment
    const accountID = body.accountID

    if (await GJCrypto.gjpCheck(gjp, accountID)) {
        await PostModel.create({
            userName, accountID, post,
            uploadDate: Math.round(Date.now() / 1000)
        })

        log.info(`Account ${userName} created a post`)
        return '1'
    } else {
        log.info(`Account ${userName}: incorrect GJP`)
        return '-1'
    }
}

export { path, required, callback }