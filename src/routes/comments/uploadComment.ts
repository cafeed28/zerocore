import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'
import { CommentModel } from '../../mongodb/models/comment'

import GJCrypto from '../../helpers/GJCrypto'
import GJHelpers from '../../helpers/GJHelpers'
import Commands from '../../helpers/Commands'
import ICommand from '../../helpers/ICommand'

let path = `/${config.basePath}/uploadGJComment21.php`
let required = ['gjp', 'userName', 'accountID', 'levelID', 'comment', 'secret']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const gjp = body.gjp
    const userName = body.userName
    const accountID = body.accountID
    const levelID = body.levelID
    const commentStr = body.comment
    const percent = body.percent || 0

    if (!await GJCrypto.gjpCheck(gjp, accountID)) {
        log.info(`Cannot upload comment on level ${levelID}: incorrect GJP`)
        return '-1'
    }

    const commentDec = Buffer.from(commentStr, 'base64').toString('utf8')
    if (commentDec.startsWith(config.prefix)) {
        const args = commentDec.slice(config.prefix.length).trim().split(/ +/)
        const commandName = args.shift().toLowerCase()

        if (Commands.has(commandName)) {
            const command: ICommand = Commands.get(commandName)
            let perms: number[] = []
            for await (let perm of command.requiredPerms) {
                perms.push(await GJHelpers.getAccountPermission(accountID, perm))
            }

            if (perms.includes(0)) {
                log.info(`Cannot use command ${commandName} on level ${levelID}: access denied`)
                return '-1'
            }

            try {
                command.execute(accountID, levelID, args)
                log.info(`Command ${commandName} used on level ${levelID}`)
                return '-1'
            }
            catch (err) {
                log.error(`Cannot use command ${commandName} on level ${levelID}`)
                log.error(err)
                return '-1'
            }
        }
    }

    CommentModel.create({
        userName: userName,
        comment: commentStr,
        levelID: levelID,
        accountID: accountID,
        percent: percent,
        uploadDate: Math.round(Date.now() / 1000),
    })

    log.info(`Comment uploaded on level ${levelID}`)
    return '1'
}

export { path, required, callback }