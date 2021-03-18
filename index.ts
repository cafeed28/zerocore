import fs from 'fs-jetpack';
import nodefs from 'fs';
import fc from 'fancy-console';
import config from './config';

import fastify from 'fastify';
import { connect, stop } from './helpers/classes/Mongoose';

console.log('ZeroCore starting...');

const app = fastify();

// error and exit handler
process.stdin.resume();

async function exitHandler(options: any, exitCode: any) {
	if (!exitCode) exitCode = 0;
	fc.error(`Stopping ZeroCore with exit code ${exitCode}...`);

	// cleanup
	await app.close();
	await stop();

	process.exit();
}

process.on('exit', exitHandler.bind(null, { cleanup: true })); // exit
process.on('SIGINT', exitHandler.bind(null, { exit: true })); // ctrl+c
process.on('uncaughtException', exitHandler.bind(null, { exit: true })); // uncaught exceptions
// kill pid
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

app.register(require('fastify-formbody'));
app.register(require('fastify-helmet'), { contentSecurityPolicy: false });

// logger and ip bans
app.addHook('preHandler', async (req, res) => {
	let ip = req.ip;
	if (config.bannedIps.includes(ip)) {
		fc.log(`${ip} banned lol`);
		return req.socket.destroy();
	}

	let date = new Date().toISOString().
		replace(/T/, ' ').replace(/\..+/, '').replace(/-/g, '.');

	console.log(`\n[${date}] ${req.method} ${ip} ${req.url}`); // [2021.02.28 16:28:40] GET 192.168.1.1 /

	console.log('Body:', req.body);
	// console.log(JSON.stringify(req.body, null, 2));
});

// 404 handler
app.setNotFoundHandler((req, res) => {
	fc.error(`Not found: ${req.method} ${req.url}`);
	res.code(404).send({ status: 'error', code: '404' });
});

// any error handler
app.setErrorHandler((err, req, res) => {
	fc.error(`${res.statusCode || 500} Internal error: ${err.message}`);
	fc.error(`Stacktrace:\n${err.stack}`);

	console.log(err);

	res.code(err.statusCode || 500).send({ status: 'error', code: err.statusCode, message: err.message });
});

app.addHook('onRoute', (opts) => {
	// console.log(opts.path);
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
		await connect(config.mongodbAddress);

		// server
		await app.listen(config.port, '0.0.0.0');
		fc.success('ZeroCore started and listening on port ' + config.port);
	} catch (err) {
		fc.error('Failed to start ZeroCore');
		fc.error(err);
		process.exit(1);
	}
}

start();