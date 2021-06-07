import tinyhttp from '@opengalaxium/tinyhttp'

import fc from 'fancy-console'
import config from '../../config'

import { UserModel } from '../../helpers/models/user'

function routes(app: tinyhttp) {
    app.get(`/${config.basePath}/api/scores/global`, async (req: any, res: any) => {
        const users = await UserModel.find({
            isBanned: false,
            stars: { $gt: 0 }
        }).sort({ stars: -1 }).limit(100)

        let i = 0
        return res.send(users.map(user => {
            i++
            return {
                place: i,
                accountID: user.accountID,
                userName: user.userName
            }
        }))
    })

    app.get(`/${config.basePath}/api/scores/creators`, async (req: any, res: any) => {
        const users = await UserModel.find({
            isBanned: false,
            creatorPoints: { $ne: 0 }
        }).sort({ creatorPoints: -1 }).limit(100)

        let i = 0
        return res.send(users.map(user => {
            i++
            return {
                place: i,
                accountID: user.accountID,
                userName: user.userName
            }
        }))
    })
}

export { routes }