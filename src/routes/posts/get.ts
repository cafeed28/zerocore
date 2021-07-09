import config from '../../config'
import log from '../../logger'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { Request, Response } from 'polka'
import { PostModel } from '../../mongodb/models/post'
import GJHelpers from '../../helpers/GJHelpers'

dayjs.extend(relativeTime)

let path = `/${config.basePath}/getGJAccountComments20.php`
let required = ['accountID', 'page']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const accountID = body.accountID
    const page = body.page

    let postsList: string[] = []

    const posts = await PostModel.find({ accountID }).skip(page * 10).limit(10).sort({ uploadDate: -1 })
    const postsCount = await PostModel.countDocuments({ accountID })

    if (!posts) {
        log.info(`Account ${accountID}: 0 posts`)
        return '-1'
    }

    posts.map(post => {
        let dateAgo = dayjs(post.uploadDate * 1000).fromNow(true)

        postsList.push(
            GJHelpers.jsonToRobtop({
                2: post.post,
                3: post.accountID,
                4: post.likes,
                5: 0,
                6: post.postID,
                7: post.isSpam,
                9: dateAgo
            }, '~')
        )
    })

    log.info(`Account ${accountID} posts recieved`)
    return `${postsList.join('|')}#${postsCount}:${page}:10`
}

export { path, required, callback }