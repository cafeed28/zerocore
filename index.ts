require('source-map-support').install();

import fs from 'fs-jetpack';
import nodefs from 'fs';
import fc from 'fancy-console';
import config from './config';

import fastify from 'fastify';
import { connect, stop } from './helpers/classes/Mongoose';

process.on('unhandledRejection', (r, p) => fc.error(`UnhandledRejection at ${p}, reason: ${r}`));

console.log('ZeroCore starting...');

const app = fastify();

app.register(require('fastify-formbody'));
app.register(require('fastify-helmet'), { contentSecurityPolicy: false });

// logger and ip bans
app.addHook('preHandler', async (req, res) => {
	let ip = req.ip;
	if (config.bannedIps.includes(ip)) {
		console.log(`${ip} banned lol`);
		return req.socket.destroy();
	}

	let date = new Date()

	console.log(`\n[${date}] ${req.method} ${ip} ${req.url}`); // [2021.02.28 16:28:40] GET 192.168.1.1 /

	console.log('Content-type: ' + req.headers['content-type']);
	console.log('Body:', req.body);
});

// 404 handler
app.setNotFoundHandler((req, res) => {
	fc.error(`Not found: ${req.method} ${req.url}`);
	res.code(404).send({ status: 'error', code: '404' });
});

// any error handler
app.setErrorHandler((e, req, res) => {
	fc.error(`${res.statusCode || 500} Internal error: ${e.message}`);
	fc.error(`Stacktrace:\n${e.stack}`);

	console.log(e);

	res.code(e.statusCode || 500).send({ status: 'error', code: e.statusCode, message: e.message });
});

// router
const routes = fs.find('./routes', { recursive: true, matching: ['*.ts', '*.js'] });
for (const route of routes) {
	const routeImport = require('.\\' + route);
	app.register(routeImport.router);
}

// start
const start = async () => {
	try {
		// MongoDB
		console.log('Connecting to MongoDB...');
		await connect(`mongodb://${config.mongodbUser}:${config.mongodbPassword}@${config.mongodbAddress}/${config.mongodbCollection}?authSource=admin`);

		// server
		await app.listen(config.port, '0.0.0.0');
		fc.success('ZeroCore started and listening on port ' + config.port);
	} catch (e) {
		fc.error('Failed to start ZeroCore');
		fc.error(e);
		process.exit(1);
	}
}

start();