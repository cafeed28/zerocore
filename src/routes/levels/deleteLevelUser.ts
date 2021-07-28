import config from '../../config'
import log from '../../logger'
import { promises as fs } from 'fs'

import { Request, Response } from 'polka'
import { ActionModel } from '../../mongodb/models/action'
import { LevelModel } from '../../mongodb/models/level'

import GJCrypto from '../../helpers/GJCrypto'
import GJHelpers from '../../helpers/GJHelpers'
import API from '../../helpers/API'
import EActions from '../../helpers/EActions'

let path = `/${config.basePath}/deleteGJLevelUser20.php`
let required = ['accountID', 'levelID', 'gjp']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const gjp = body.gjp || 0
    const accountID = body.accountID

    const levelID = body.levelID

    if (!await GJCrypto.gjpCheck(gjp, accountID)) {
        log.info(`Cannot delete level ${levelID} from account ${accountID}: incorrect GJP`)
        return '-1'
    }

    try {
        await fs.copyFile(`data/levels/${levelID}`, `data/levels/deleted/${levelID}`)
        await fs.unlink(`data/levels/${levelID}`)
    } catch (err) {
        if (err.code == 'ENOENT') {
            log.info(`Cannot delete level ${levelID}: level file not exists`)
            log.info(`Level deleted from database`)
        }
        else {
            log.error(`Cannot delete level ${levelID}`)
            log.error(err.stack)
            return '-1'
        }
    }

    await LevelModel.deleteOne({ levelID })
    await ActionModel.create({
        actionType: EActions.levelDelete,
        IP: req.socket.remoteAddress,
        timestamp: Date.now(),
        accountID: accountID,
        itemID: levelID,
    })

    await GJHelpers.updateCreatorPoints(levelID)

    if (!await API.sendDiscordLog('Deleted Level', `${accountID} deleted a level`, levelID)) {
        log.info(`Discord Webhook error`)
    }

    log.info(`Level ${levelID} deleted from account ${accountID}`)
    return levelID
}

export { path, required, callback }