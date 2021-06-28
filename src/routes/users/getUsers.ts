import config from '../../config'
import log from '../../logger'

import { ExpressIncomingMessage, ExpressServerResponse } from '@opengalaxium/tinyhttp'

import { UserModel } from '../../mongodb/models/user'

import GJHelpers from '../../helpers/GJHelpers'

let path = `/${config.basePath}/getGJUsers20.php`
let required = ['page', 'str']
let callback = async (req: ExpressIncomingMessage, res: ExpressServerResponse) => {
    const body = req.body

    let usersList: string[] = []

    const users = await UserModel.find({ userName: new RegExp(body.str, 'i') })

    if (!users.length) {
        log.info('no users')
        return res.send(`#0:${body.page}:10`)
    } else {
        users.map(user => {
            usersList.push(GJHelpers.jsonToRobtop([{
                '1': user.userName,
                '2': user.accountID,
                '3': user.stars,
                '4': user.demons,
                '8': user.creatorPoints,
                '9': user.accIcon,
                '10': user.color1,
                '11': user.color2,
                '13': user.coins,
                '14': user.iconType,
                '15': user.special,
                '16': user.accountID,
                '17': user.userCoins
            }]))
        })
    }
    log.info(`get users success`)

    return res.send(usersList.join('|') + `#${users.length}:${body.page}:10`)
}

export { path, required, callback }