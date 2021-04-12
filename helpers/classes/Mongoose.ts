import fc from 'fancy-console';

import mongoose from 'mongoose';

const connect = async (address: string) => {
	await mongoose.connect(address, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false
	});
}

const stop = async () => {
	await mongoose.connection.close();
}

const connection = mongoose.connection;

connection.on('error', (err) => {
	fc.error('MongoDB Connection error:', err.message);
	process.exit();
});

connection.once('open', () => {
	fc.success('MongoDB connected');
});

export { connect, stop };