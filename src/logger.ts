import fs from 'fs'
import pino from 'pino'
import pinoms from 'pino-multi-stream'

import dayjs from 'dayjs'
import config from './config'

let level = config.debug ? 'trace' : 'info'

// const streams = [
//     { stream: process.stdout },
//     { stream: fs.createWriteStream('./zerocore.log', { flags: 'a' }) },
// ]

const log = pino(
    {
        prettyPrint: true,
        base: {
            pid: false,
        },
        timestamp: () => `,'time':'${dayjs().format('DD.MM.YYYY HH:mm:ss:SSS')}'`,
        level,
    },
    // pinoms.multistream(streams)
)

export default log