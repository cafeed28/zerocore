import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'
import { DailyModel } from '../../mongodb/models/daily'

let path = `/${config.basePath}/getGJDailyLevel.php`
let required = []
let callback = async (req: Request, res: Response) => {
    const body = req.body

    let type = body.weekly || 0
    if (type == 0) {
        // daily
        var midnight = Math.round(
            new Date().setUTCHours(24, 0, 0) / 1000
        ) // next midnight
    } else {
        // weekly
        const d = new Date()
        var midnight = Math.round(
            new Date(
                d.setUTCDate(d.getUTCDate() + ((1 + 7 - d.getUTCDay()) % 7))
            ).getTime() / 1000
        ) // next monday
    }

    const time = Math.round(new Date().getTime() / 1000)

    console.log(time + ' ' + midnight)

    let daily = await DailyModel.find({
        timestamp: {
            $lt: time,
        },
        type: type,
    }).sort({ timestamp: -1 })

    if (!daily) {
        log.info('Daily level not found')
        return '-1'
    }

    let dailyID = daily[0].levelID

    if (type == 1) {
        // weekly
        dailyID += 100001 // fuck robtop...
    }

    let timeleft = midnight - time

    let result = `${dailyID}|${timeleft}`
    log.info('Daily level recieved')
    console.log(result)
    return result
}

export { path, required, callback }