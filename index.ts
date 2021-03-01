import fs from 'fs-jetpack';
import fc from 'fancy-console';
import config from './config';

import express from 'express';
import bodyParser from 'body-parser';
import { connect } from './helpers/classes/Mongoose';

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
		console.log(`${ip} banned lol`);
		return req.socket.destroy();
	}

	let date = new Date().toISOString().
		replace(/T/, ' ').replace(/\..+/, '').replace(/-/g, '.');

	console.log(`\n[${date}] ${req.method} ${ip} ${req.url}\nBody:`); // [2021.02.28 16:28:40] GET 192.168.1.1 /
	console.log(req.body);
	next();
});

// Использование транспортов
const routes = fs.find('./routes', { recursive: true, matching: ['*.ts'] });
for (const route of routes) {
	const routeImport = require('.\\' + route);
	app.use(routeImport.router);
}

// Обработка 404
app.use((req, res, next) => {
	res.status(404);
	console.error('Not found URL: ' + req.url);
	res.send({ status: 'error', code: '404' });
	return;
});

// Обработка всех остальных ошибок
app.use((err: any, req: any, res: any, next: any) => {
	res.status(err.status || 500);
	console.error(`${res.statusCode} Internal error: ${err.message}`);
	res.send({ status: 'error', code: err.statusCode, message: err.message });
	return;
});

app.listen(80, async () => {
	console.log('Connecting to MongoDB...');
	await connect();
	fc.success('ZeroCore started and listening on port 80');
});