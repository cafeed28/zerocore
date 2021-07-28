import config from '../../config'
import log from '../../logger'

import { Request, Response } from 'polka'

let path = `/${config.basePath}/api/restart`
let required = []
let callback = async (req: Request, res: Response) => {
    const key = req.body.key || req.query.key

    if (config.apiKey != key) {
        log.info(`Cannot restart server with API key ${key}`)
        return {
            'status': 'error',
            'code': 'accessDenied'
        }
    }

    log.info(`Restarting server...`)
    res.end(
        JSON.stringify({
            'status': 'success'
        }, null, 2)
    )

    process.exit(2)
}

export { path, required, callback }