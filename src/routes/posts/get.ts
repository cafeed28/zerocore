import config from '../../config'
import log from '../../logger'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { ExpressIncomingMessage, ExpressServerResponse } from '@opengalaxium/tinyhttp'
import { PostModel } from '../../mongodb/models/post'

dayjs.extend(relativeTime)

let path = `/${config.basePath}/getGJAccountComments20.php`
let required = ['accountID', 'page']
let callback = async (req: ExpressIncomingMessage, res: ExpressServerResponse) => {
    const body = req.body

    const accountID = body.accountID
    const page = body.page

    let postsList: string[] = []

    const posts = await PostModel.find({ accountID }).skip(page * 10).limit(10).sort({ uploadDate: -1 })
    const postsCount = await PostModel.countDocuments({ accountID })

    if (!posts) {
        log.info(`${accountID} 0 posts`)
        return res.send('#0:0:10')
    } else {
        posts.map(post => {
            let dateAgo = dayjs(post.uploadDate * 1000).fromNow(true)

            postsList.push(`2~${post.post}~3~${post.accountID}~4~${post.likes}~5~0~7~${post.isSpam}~9~${dateAgo}~6~${post.postID}`)
        })

        log.info(`success`)
        return res.send(`${postsList.join('|')}#${postsCount}:${page}:10`)
    }
}

export { path, required, callback }