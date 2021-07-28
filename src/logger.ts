import fs from 'fs'
import pino from 'pino'
import pinoPretty from 'pino-pretty'

import dayjs from 'dayjs'
import config from './config'

const inspector = require('inspector')

let level = config.debug ? 'trace' : 'info'

const log = pino({
    prettyPrint: true,
    base: {
        pid: false,
    },
    timestamp: () => `,'time':'${dayjs().format('DD.MM.YYYY HH:mm:ss:SSS')}'`,
    level,
    prettifier: inspectorSupport
})

function inspectorSupport(opts) {
    const pretty = pinoPretty(opts)

    return prettifier

    function prettifier(obj) {
        let message = pretty(obj)

        let inspectorMessage = message.trim()

        if (inspector.url()) {
            if (obj.level < 30) {
                inspector.console.debug(inspectorMessage)
            } else if (obj.level >= 50) {
                inspector.console.error(inspectorMessage)
            } else if (obj.level >= 40) {
                inspector.console.warn(inspectorMessage)
            } else {
                inspector.console.log(inspectorMessage)
            }
        }

        return message
    }
}

export default log