import fs from 'fs-jetpack';
import nodefs from 'fs';
import fc from 'fancy-console';
import config from './config';

import express from 'express';
import bodyParser from 'body-parser';
import { connect } from './helpers/classes/Mongoose';

console.log('ZeroCore Starting...');

// Обработчик выхода и ошибок
process.stdin.resume();

function exitHandler(options: any, exitCode: any) {
	if (options.cleanup) fc.log('clean');
	if (exitCode || exitCode === 0) fc.log(exitCode);
	if (options.exit) process.exit();
}

process.on('exit', exitHandler.bind(null, { cleanup: true })); // exit
process.on('SIGINT', exitHandler.bind(null, { exit: true })); // ctrl+c
process.on('uncaughtException', exitHandler.bind(null, { exit: true })); // uncaught exceptions
// kill pid (например, nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

const app = express();

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Защита от атак
app.use(require('helmet')());

// Логгер и игнор забаненных IP
app.use((req, res, next) => {
	let ip = req.ip.slice(7);
	if (config.bannedIps.includes(ip)) {
		fc.log(`${ip} banned lol`);
		return req.socket.destroy();
	}

	let date = new Date().toISOString().
		replace(/T/, ' ').replace(/\..+/, '').replace(/-/g, '.');

	console.log(`\n[${date}] ${req.method} ${ip} ${req.url}`); // [2021.02.28 16:28:40] GET 192.168.1.1 /
	console.log(`Body:`);
	console.log(JSON.parse(JSON.stringify(req.body)));
	next();
});

// Использование транспортов
const routes = fs.find('./routes', { recursive: true, matching: ['*.ts', '*.js'] });
for (const route of routes) {
	const routeImport = require('.\\' + route);
	app.use('/', routeImport.router);
}

// Обработка 404
app.use((req, res, next) => {
	res.status(404);
	fc.error('Not found URL: ' + req.url);
	res.send({ status: 'error', code: '404' });
	return;
});

// Обработка всех остальных ошибок
app.use((err: any, req: any, res: any, next: any) => {
	res.status(err.status || 500);
	fc.error(`${res.statusCode} Internal error: ${err.message}`);
	fc.error(`Stack trace:\n${err.stack}`);
	res.send({ status: 'error', code: err.statusCode, message: err.message });
	return;
});

app.listen(80, async () => {
	fc.log('Connecting to MongoDB...');
	await connect();
	fc.success('ZeroCore started and listening on port 80');
});