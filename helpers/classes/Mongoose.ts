import fc from 'fancy-console';
import c from '../../config';

import mongoose from 'mongoose';

const connect = async (address: string) => {
	try {
		await mongoose.connect(`mongodb://${c.mongodbUser}:${c.mongodbPassword}@${c.mongodbAddress}/${c.mongodbDatabase}`, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false
		});
	}
	catch (e) {
		throw e
	};
}

const stop = async () => {
	await mongoose.connection.close();
}

const connection = mongoose.connection;

connection.on('error', (err) => {
	fc.error('MongoDB Connection error:', err.message);
	process.exit(1);
});

connection.once('open', () => {
	fc.success('MongoDB connected');
});

export { connect, stop };