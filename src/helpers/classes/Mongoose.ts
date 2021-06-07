import fc from 'fancy-console'

import mongoose from 'mongoose'

const connect = async (conString: string) => {
	try {
		await mongoose.connect(conString, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false
		})
	}
	catch (e) {
		throw e
	};
}

const stop = async () => {
	await mongoose.connection.close()
}

const connection = mongoose.connection

connection.on('error', (e) => {
	fc.error('MongoDB Connection error:', e.message)
	process.exit(1)
})

connection.once('open', () => {
	fc.success('MongoDB connected')
})

export { connect, stop }