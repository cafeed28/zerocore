import config from '../../../config'
import log from '../../../logger'

import { ClanModel } from '../../../mongodb/models/clan'
import { ClanAssignModel } from '../../../mongodb/models/clanAssign'

import GJCrypto from '../../../helpers/GJCrypto'

import { Request, Response } from 'polka'

let path = `/${config.basePath}/api/clans/join`
let required = ['clanName', 'accountID', 'gjp']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const clanName = body.clanName
    let accountID = body.accountID
    let gjp = body.gjp

    if (!await GJCrypto.gjpCheck(gjp, accountID)) {
        log.info(`Cannot join in clan ${clanName} with account ${accountID}: incorrect gjp`)
        return {
            'status': 'error',
            'code': 'authError'
        }
    }

    let clan = await ClanModel.findOne({ clanName })

    if (!clan) {
        log.info(`Cannot join in clan ${clanName} with account ${accountID}: clan not found`)
        return {
            'status': 'error',
            'code': 'notFound'
        }
    }

    let clanAssign = await ClanAssignModel.findOne({ accountID, clanName })
    if (clanAssign) {
        return {
            'status': 'error',
            'code': 'alreadyJoined'
        }
    }

    await ClanAssignModel.create({ accountID, clanName })

    log.info(`Account ${accountID} joined to clan ${clanName}`)
    return {
        'status': 'success',
        'value': clan.clanAccountID
    }
}

export { path, required, callback }