import config from '../../../config'
import log from '../../../logger'
import bcrypt from 'bcrypt'

import { AccountModel } from '../../../mongodb/models/account'
import { ClanModel } from '../../../mongodb/models/clan'
import { UserModel } from '../../../mongodb/models/user'

import { Request, Response } from 'polka'

let path = `/${config.basePath}/api/clans/create`
let required = ['clanName', 'badgeUrl']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const clanName = body.clanName
    let badgeUrl = body.badgeUrl

    let clan = await ClanModel.findOne({ clanName })

    if (clan) {
        log.info(`Clan ${clanName} already exists`)
        return {
            'status': 'error',
            'code': 'alreadyExists'
        }
    }

    let email = clanName + '@example.com'
    let password = clanName + 'password'

    await AccountModel.create({ userName: clanName, password: await bcrypt.hash(password, 10), email })

    let account = await AccountModel.findOne({ userName: clanName, email })

    try {
        clan = await ClanModel.create({ clanName, badgeUrl, clanAccountID: account.accountID })
    }
    catch (err) {
        if (err.name == 'ValidationError') {
            if (err.kind == 'required') {
                return {
                    'status': 'error',
                    'code': 'requiredError'
                }
            }
        }

        log.error(`Unknown error while creating clan ${clanName}`)
        log.error(err)
        return {
            'status': 'error',
            'code': 'unknownError'
        }
    }

    await UserModel.updateOne({ accountID: account.accountID }, {
        userName: clanName,
        coins: 0,
        userCoins: 0,
        stars: 0,
        diamonds: 0,
        special: 0,
        demons: 0,

        color1: 0,
        color2: 0,
        icon: 0,
        iconType: 0,

        accIcon: 0,
        accShip: 0,
        accBall: 0,
        accBird: 0,
        accDart: 0,
        accRobot: 0,
        accSpider: 0,
        accGlow: 0,
        accExplosion: 0,

        IP: '',
        lastPlayed: 0
    }, { upsert: true, setDefaultsOnInsert: true })

    log.info(`Clan ${clanName} created`)
    return {
        'status': 'success',
        'value': clan.clanAccountID
    }
}

export { path, required, callback }