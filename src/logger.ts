import logger from 'pino'
import dayjs from 'dayjs'
import config from './config'

let level = config.debug ? 'trace' : 'info'

const log = logger({
    prettyPrint: true,
    base: {
        pid: false,
    },
    timestamp: () => `,'time':'${dayjs().format('DD.MM.YYYY HH:mm:ss:SSS')}'`,
    level
})

export default log