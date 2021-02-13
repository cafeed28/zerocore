import fs from 'fs-jetpack';
import fc from 'fancy-console';
import config from './config';

import express from 'express';
import bodyParser from 'body-parser';
import { connect } from './helpers/Mongoose';

const app = express();

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Логгер и игнор забаненных IP
app.use((req, res, next) => {
	let ip = req.ip.slice(7);
	if (config.bannedIps.includes(ip)) {
		console.log(`${ip} banned lol`);
		return next();
	}

	console.log(`\n[${req.method}] ${ip} ${req.url}\nBody:`);
	console.log(req.body);
	next();
});

// Использование транспортов
const routes = fs.find('./routes', { recursive: true, matching: ['*.ts'] });
for (const route of routes) {
	const routeImport = require('.\\' + route);
	app.use(`/${config.basePath}`, routeImport.router);
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