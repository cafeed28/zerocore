import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'
import { GauntletModel } from '../../mongodb/models/gauntlet'

import GJCrypto from '../../helpers/GJCrypto'

let path = `/${config.basePath}/getGJGauntlets21.php`
let required = []
let callback = async (req: Request, res: Response) => {
    const body = req.body

    let gauntletsList = []
    let gauntletLevels = ''

    let gauntlets = await GauntletModel
        .find({ levelID5: { $ne: 0 } })
        .sort({ gauntletID: 1 })

    for (let gauntlet of gauntlets) {
        let levels = `${gauntlet.levelID1},${gauntlet.levelID2},${gauntlet.levelID3},${gauntlet.levelID4},${gauntlet.levelID5}`
        gauntletLevels += gauntlet.packID + levels

        gauntletsList.push(`1:${gauntlet.packID}:3:${levels}`)
    }

    let hash = GJCrypto.genSolo2(gauntletLevels)
    let result = `${gauntletsList.join('|')}#${hash}`
    console.log(result)

    log.info(`Gauntlets recieved`)
    return result
}

export { path, required, callback }