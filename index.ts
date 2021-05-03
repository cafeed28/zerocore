require('source-map-support').install();

import fs from 'fs-jetpack';
import nodefs from 'fs';
import fc from 'fancy-console';
import config from './config';
import bodyParser from 'body-parser';

// import fastify from 'fastify';
import express from 'express';
import { connect, stop } from './helpers/classes/Mongoose';

// process.on('unhandledRejection', (r, p) => fc.error(`UnhandledRejection at ${p}, reason: ${r}`));

console.log('ZeroCore starting...');

// const app = fastify();
const app = express();

// app.register(require('fastify-formbody'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// logger and ip bans
app.use((req, res, next) => {
	let ip = req.ip;
	if (config.bannedIps.includes(ip)) {
		console.log(`${ip} banned lol`);
		return req.socket.destroy();
	}

	let date = new Date();

	if (req.url.endsWith('.php')) req.url = req.url.substring(0, req.url.indexOf('.php'));

	console.log(`\n[${date}] ${req.method} ${ip} ${req.url}`);

	console.log('Content-type: ' + req.headers['content-type']);
	console.log('Body:', req.body);
	next();
});

// router
const routes = fs.find('./routes', { recursive: true, matching: ['*.ts', '*.js'] });
for (const route of routes) {
	const routeImport = require('.\\' + route);
	app.use(routeImport.router);
}

// 404 handler
app.use((req, res) => {
	fc.error(`Not found: ${req.method} ${req.url}`);
	return res.status(404).send({ status: 'error', code: 404 });
});

// any error handler
app.use((e: any, req: any, res: any, next: any) => {
	fc.error(`${e.statusCode || 500} Internal error: ${e.message}`);
	fc.error(`Stacktrace:`, e.stack);

	console.error(e);

	return res.status(e.statusCode || 500).send({ status: 'error', code: e.statusCode });
});

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