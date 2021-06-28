import fs from 'fs-jetpack'
import log from './logger'
import { connect } from './mongodb/connect'
import config from './config'

import tinyhttp from '@opengalaxium/tinyhttp'
import { parser } from '@opengalaxium/tinyhttp'
import WebHelper from './helpers/WebHelper'

const app = new tinyhttp({ log: false })

app.use(parser.json)
app.use(parser.urlencoded)
app.use((req, res, next) => {
    log.info(`${req.method} ${req.socket.remoteAddress} ${req.url}`)
    log.debug(req.body)
    next()
})

app.setErrorHandler((err, req, res) => {
    if (err.message.toLowerCase() == 'not found') {
        log.info(`${req.method} ${req.url} Not Found`)
        return res.send('Not Found')
    }
    else {
        log.error('## TINYHTTP ERROR ##', err)
    }
})

const routesFiles = fs.find('./routes', { recursive: true, matching: ['*.ts', '*.js'] })

for (const routePath of routesFiles) {
    const route = require('.\\' + routePath)

    app.all(route.path, async (req, res) => {
        if (!WebHelper.checkKeys(req.body, route.required)) {
            log.info(`request dosen't contain required parameters`)
            return res.send('Bad Request', 400)
        }
        // if (route.required.includes('secret') && req.body.secret != config.secret) {
        //     log.info('secret mismatch')
        //     return res.send('secret mismatch', 403)
        // }
        try {
            let response = await route.callback(req, res)
            res.send(response);
        }
        catch (err) {
            log.error('## CALLBACK ERROR ##', err)
        }
    })
}

const start = async () => {
    try {
        // MongoDB
        log.info('Connecting to MongoDB...')
        // await connect(`mongodb://${config.mongodbUser}:${config.mongodbPassword}@${config.mongodbAddress}/${config.mongodbCollection}?authSource=admin`)
        await connect(`mongodb://${config.mongodbAddress}/${config.mongodbCollection}?authSource=admin`)

        // server
        await app.run(config.port, '0.0.0.0')
        log.info('ZeroCore started and listening on port ' + config.port)
    } catch (e) {
        log.fatal('Failed to start ZeroCore')
        log.fatal(e)
        process.exit(1)
    }
}

start()