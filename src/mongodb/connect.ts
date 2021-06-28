import log from '../logger'
import mongoose from 'mongoose'

const connect = async (conString: string) => {
    try {
        await mongoose.connect(conString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        })
    }
    catch (e) {
        throw e
    }
}

const stop = async () => {
    await mongoose.connection.close()
}

const connection = mongoose.connection

connection.on('error', (e) => {
    log.fatal('MongoDB Connection error')
    log.fatal(e)
    process.exit(1)
})

connection.once('open', () => {
    log.info('MongoDB Connected')
})

export { connect, stop }