import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'
import { MapPackModel } from '../../mongodb/models/mappack'

import GJHelpers from '../../helpers/GJHelpers'
import GJCrypto from '../../helpers/GJCrypto'

let path = `/${config.basePath}/getGJMapPacks21.php`
let required = ['secret', 'page']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const page = body.page
    const offset = page * 10

    let packsList = []
    let lvlsMulti: number[] = []

    let packs = await MapPackModel
        .find()
        .sort({ packID: 1 })
        .skip(offset)
        .limit(10)

    let packsCount = await MapPackModel.countDocuments()

    for (let pack of packs) {
        lvlsMulti.push(pack.packID)

        let colors2 = pack.colors2 == 'none' ? pack.color : pack.colors2

        packsList.push(
            GJHelpers.jsonToRobtop({
                1: pack.packID,
                2: pack.packName,
                3: pack.levels,
                4: pack.stars,
                5: pack.coins,
                6: pack.difficulty,
                7: pack.color,
                8: colors2
            })
        )
    }

    let hash = await GJCrypto.genPack(lvlsMulti.join(','))
    let result = `${packsList.join('|')}#${packsCount}:${offset}:10#${hash}`

    log.info(`MapPacks recieved`)
    return result
}

export { path, required, callback }