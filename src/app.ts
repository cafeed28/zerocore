import fs from 'fs-jetpack'
import log from './logger'
import { connect } from './mongodb/connect'
import config from './config'

import polka, { IOptions } from 'polka'
import http from 'http'
import bodyParser from 'body-parser'
import WebHelper from './helpers/WebHelper'

const options: IOptions = {
    onError: WebHelper.errorHandler
}

const app = polka(options)

app.use(bodyParser.json({ limit: '8mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '8mb' }))

app.use((req, res, next) => {
    log.info(`${req.method} ${req.socket.remoteAddress} ${req.url}`)
    log.debug(req.body)
    next()
})

const routesFiles = fs.find('./routes', { recursive: true, matching: ['*.ts', '*.js'] })

for (const routePath of routesFiles) {
    const route = require('.\\' + routePath)

    app.all(route.path, async (req, res) => {
        if (!WebHelper.checkKeys(req.body, route.required)) {
            log.info(`request dosen't contain required parameters`)
            return res
                .writeHead(400, http.STATUS_CODES[400])
                .end(http.STATUS_CODES[400])
        }
        try {
            let response = await route.callback(req, res)
            if (typeof response == 'object')
                response = JSON.stringify(response, null, 2)

            res.end(response.toString())
            if (config.debug) console.log(response)
            console.log()
        }
        catch (err) {
            log.error('## CALLBACK ERROR ##')
            log.error(err)
            return res
                .writeHead(500, http.STATUS_CODES[500])
                .end(http.STATUS_CODES[500])
        }
    })
}

const start = async () => {
    try {
        // MongoDB
        log.info('Connecting to MongoDB...')
        await connect(config.mongodbUri)

        // server
        await app.listen(config.port, '0.0.0.0')
        log.info('ZeroCore started and listening on port ' + config.port)
    } catch (e) {
        log.fatal('Failed to start ZeroCore')
        log.fatal(e)
        process.exit(1)
    }
}

start()