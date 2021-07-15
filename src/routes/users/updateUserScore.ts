import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'
import { AccountModel } from '../../mongodb/models/account'
import { UserModel } from '../../mongodb/models/user'
import { ActionModel } from '../../mongodb/models/action'
import EActions from '../../helpers/EActions'

import GJCrypto from '../../helpers/GJCrypto'

let path = `/${config.basePath}/updateGJUserScore22.php`
let required = ['userName', 'accountID', 'stars', 'demons', 'icon', 'color1', 'color2', 'gjp']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const userName = body.userName
    const stars = body.stars
    const demons = body.demons
    const icon = body.icon
    const color1 = body.color1
    const color2 = body.color2

    const coins = body.coins || 0
    const userCoins = body.userCoins || 0
    const diamonds = body.diamonds || 0
    const special = body.special || 0

    const iconType = body.iconType || 0
    const accIcon = body.accIcon || 0
    const accShip = body.accShip || 0
    const accBall = body.accBall || 0
    const accBird = body.accBird || 0
    const accDart = body.accDart || 0
    const accRobot = body.accRobot || 0
    const accSpider = body.accSpider || 0
    const accGlow = body.accGlow || 0
    const accExplosion = body.accExplosion || 0

    if (body.udid) {
        if (!isNaN(body.udid)) {
            log.info(`Cannot update user ${body.userName} stats: udid is numeric`)
            return '-1'
        }
    }

    const id = body.accountID

    if (!await AccountModel.findOne({ accountID: id })) {
        log.info(`Cannot update user ${body.userName} stats: account not found`)
        return '-1'
    }

    if (!await GJCrypto.gjpCheck(body.gjp, id)) {
        log.info(`Cannot update user ${body.userName} stats: incorrect GJP`)
        return '-1'
    }

    const ip = req.socket.remoteAddress

    await UserModel.updateOne({ accountID: id }, {
        userName: userName,
        coins: coins,
        userCoins: userCoins,
        stars: stars,
        diamonds: diamonds,
        special: special,
        demons: demons,

        color1: color1,
        color2: color2,
        icon: icon,
        iconType: iconType,

        accIcon: accIcon,
        accShip: accShip,
        accBall: accBall,
        accBird: accBird,
        accDart: accDart,
        accRobot: accRobot,
        accSpider: accSpider,
        accGlow: accGlow,
        accExplosion: accExplosion,

        IP: ip,
        lastPlayed: Math.round(new Date().getTime() / 1000)
    }, { upsert: true, setDefaultsOnInsert: true })

    await ActionModel.create({
        actionType: EActions.itemLike,
        IP: ip,
        timestamp: Date.now()
    })

    log.info(`User ${body.userName} stats updated`)
    return id
}

export { path, required, callback }