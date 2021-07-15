import config from '../../config'
import drc from '../../dailyRewardsConfig'
import log from '../../logger'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { Request, Response } from 'polka'
import { UserModel } from '../../mongodb/models/user'

import GJHelpers from '../../helpers/GJHelpers'
import GJCrypto from '../../helpers/GJCrypto'
import XOR from '../../helpers/XOR'

dayjs.extend(relativeTime)

let path = `/${config.basePath}/getGJRewards.php`
let required = ['secret', 'chk', 'gjp']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const accountID = body.accountID
    const udid = body.udid
    let chk: string = body.chk
    const gjp = body.gjp
    const rewardType = body.rewardType

    if (!await GJCrypto.gjpCheck(gjp, accountID)) {
        log.info(`Account ${accountID} cannot claim reward: incorrect GJP`)
        return '-1'
    }

    const user = await UserModel.findOne({ accountID })
    if (!user) {
        log.info(`Account ${accountID} cannot claim reward: user not found`)
        return '-1'
    }

    chk = XOR.cipher(Buffer.from(chk.substring(5), 'base64').toString(), 59182)

    let time = Math.round(Date.now() / 1000) + 100

    let chest1Time = user.chest1Time
    let chest1Count = user.chest1Count
    let chest2Time = user.chest2Time
    let chest2Count = user.chest2Count

    let chest1Diff = time - chest1Time
    let chest2Diff = time - chest2Time

    let chest1Left = Math.max(0, drc.c1Timeout - chest1Diff)
    let chest2Left = Math.max(0, drc.c2Timeout - chest2Diff)

    if (rewardType == 1) {
        if (chest1Left != 0) {
            log.info(`No Reward 1 for account ${accountID}`)
            return '-1'
        }
        chest1Count++
        await user.updateOne({ chest1Count: chest1Count, chest1Time: time })
        chest1Left = drc.c1Timeout
    }
    else if (rewardType == 2) {
        if (chest2Left != 0) {
            log.info(`No Reward 2 for account ${accountID}`)
            return '-1'
        }
        chest2Count++
        await user.updateOne({ chest2Count: chest2Count, chest2Time: time })
        chest2Left = drc.c2Timeout
    }

    const r = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

    let chest1Content = `${r(drc.c1MinOrbs, drc.c1MaxOrbs)},${r(drc.c1MinDiamonds, drc.c1MaxDiamonds)},${r(drc.c1MinShards, drc.c1MaxShards)},${r(drc.c1MinKeys, drc.c1MaxKeys)}`
    let chest2Content = `${r(drc.c2MinOrbs, drc.c2MaxOrbs)},${r(drc.c2MinDiamonds, drc.c2MaxDiamonds)},${r(drc.c2MInItemID, drc.c2MaxItemID)},${r(drc.c1MinKeys, drc.c1MaxKeys)}`

    let str = `1:${accountID}:${chk}:${udid}:${accountID}:${chest1Left}:${chest1Content}:${chest1Count}:${chest2Left}:${chest2Content}:${chest2Count}:${rewardType}`
    let xor = XOR.cipher(str, 59182)
    let result = Buffer.from(xor).toString('base64').replace('/', '_').replace('+', '-')

    let hash = GJCrypto.genSolo4(result)

    log.info(`Account ${accountID} claimed Reward ${rewardType}`)
    return `SaKuJ${result}|${hash}`
}

export { path, required, callback }