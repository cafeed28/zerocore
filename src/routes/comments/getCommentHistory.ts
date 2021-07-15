import config from '../../config'
import log from '../../logger'
import dayjs from 'dayjs'

import { Request, Response } from 'polka'
import { CommentModel } from '../../mongodb/models/comment'
import { RoleAssignModel } from '../../mongodb/models/roleAssign'
import { RoleModel } from '../../mongodb/models/role'
import { UserModel } from '../../mongodb/models/user'

import GJHelpers from '../../helpers/GJHelpers'
import EPermissions from '../../helpers/EPermissions'

let path = `/${config.basePath}/getGJCommentHistory.php`
let required = ['page', 'userID']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const accountID = body.userID
    const page = body.page
    const mode = body.mode || 0

    let orderBy: any = { commentID: -1 }
    if (mode == 1) orderBy = { likes: -1 }

    let commentsList = []

    const comments = await CommentModel.find({ accountID: accountID }).skip(page * 10).limit(10).sort(orderBy)
    const commentsCount = await CommentModel.countDocuments({ accountID: accountID })

    if (!comments) {
        log.info(`Account ${accountID} comments recieved`)
        return '-2'
    } else {
        const user = await UserModel.findOne({ accountID: accountID })

        for (const comment of comments) {
            const roleAssign = await RoleAssignModel.findOne({ accountID: comment.accountID })

            let userRole
            if (roleAssign) {
                userRole = await RoleModel.findOne({ roleID: roleAssign.roleID })
            }

            let prefix
            let badgeLevel
            let commentColor

            if (userRole) {
                prefix = userRole.prefix + ' - '
                badgeLevel = await GJHelpers.getAccountPermission(comment.accountID, EPermissions.badgeLevel)
                commentColor = userRole.commentColor
            }

            let dateAgo = dayjs(comment.uploadDate * 1000).fromNow(true)

            // робтоп когда json
            commentsList.push(`2~${comment.comment}~3~${comment.accountID}~4~${comment.likes}~5~0~7~${+comment.isSpam}~9~${prefix || ''}${dateAgo}~6~${comment.commentID}~10~${comment.percent}`
                +
                `~11~${badgeLevel || 0}~12~${commentColor || 0}:1~${user.userName}~7~1~9~${user.icon}~10~${user.color1}~11~${user.color2}~14~${user.iconType}~15~${user.special}~16~${user.accountID}`)
        }
        log.info(`Account ${accountID} comments recieved`)

        const result = `${commentsList.join('|')}#${commentsCount}:${page}:10`
        return result
    }
}

export { path, required, callback }