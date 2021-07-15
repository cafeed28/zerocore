import config from '../../config'
import drc from '../../dailyRewardsConfig'
import log from '../../logger'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { Request, Response } from 'polka'
import { UserModel } from '../../mongodb/models/user'
import { QuestModel } from '../../mongodb/models/quest'

import GJHelpers from '../../helpers/GJHelpers'
import GJCrypto from '../../helpers/GJCrypto'
import XOR from '../../helpers/XOR'

dayjs.extend(relativeTime)

let path = `/${config.basePath}/getGJChallenges.php`
let required = ['secret', 'chk', 'gjp']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const accountID = body.accountID
    const udid = body.udid
    let chk: string = body.chk
    const gjp = body.gjp

    if (!await GJCrypto.gjpCheck(gjp, accountID)) {
        log.info(`Account ${accountID} cannot get Challenges List: incorrect GJP`)
        return '-1'
    }

    const user = await UserModel.findOne({ accountID })

    if (!user) {
        log.info(`Account ${accountID} cannot get Challenges List: user not found`)
        return '-1'
    }

    let time = Math.round(Date.now()) / 1000

    chk = XOR.cipher(Buffer.from(chk.substring(5), 'base64').toString(), 19847)

    let from = Math.round(new Date('2000-12-17').getTime()) / 1000
    let diff = time - from

    let questID = Math.floor(diff / 86400) * 3

    let midnight = Math.round(new Date(new Date().setUTCHours(24, 0, 0)).getTime() / 1000) // next midnight
    let timeleft = midnight - time

    let quests = await QuestModel.find()
    let array: any[] = []

    for (let i = 0; i < quests.length; i++) {
        let r = Math.floor(Math.random() * quests.length)
        array.push(quests[r])
        quests.splice(r, 1)
    }

    quests = array

    let quest1 = `${questID},${quests[0].type},${quests[0].amount},${quests[0].reward},${quests[0].questName}`
    let quest2 = `${questID + 1},${quests[1].type},${quests[1].amount},${quests[1].reward},${quests[1].questName}`
    let quest3 = `${questID + 2},${quests[2].type},${quests[2].amount},${quests[2].reward},${quests[2].questName}`

    let str = `SaKuJ:${accountID}:${chk}:${udid}:${accountID}:${timeleft}:${quest1}:${quest2}:${quest3}`
    let xor = XOR.cipher(str, 19847)
    let result = Buffer.from(xor).toString('base64')

    let hash = GJCrypto.genSolo3(result)

    log.info(`Recieved Challenges List for account ${accountID}`)
    return `SaKuJ${result}|${hash}`
}

export { path, required, callback }