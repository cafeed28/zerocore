import config from '../../config'

import { Request, Response } from 'polka'
import { ClanModel } from '../../mongodb/models/clan'
import { ClanAssignModel } from '../../mongodb/models/clanAssign'

let path = `/${config.basePath}/getBadges`
let required = ['targetAccountID']
let callback = async (req: Request, res: Response) => {
    let accountID = req.body.targetAccountID

    let badges = []
    let clanAssigns = await ClanAssignModel.find({ accountID })

    for (let i = 0; i < clanAssigns.length; i++) {
        let clanAssign = clanAssigns[i]
        let clan = await ClanModel.findOne({ clanName: clanAssign.clanName })
        badges[i] = clan.badgeUrl
    }

    let result = []

    for (let i = 0; i < badges.length; i++) {
        let badge = badges[i]
        result[i] = i + '=' + badge
    }

    return result.join('&') // '1=url&2=url'
}

export { path, required, callback }