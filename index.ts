import fs from 'fs-jetpack';
import config from './config';

import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';

const app = express();

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(morgan(':remote-addr :remote-user :method :url :status - :response-time ms')); // лог всех ошибок
app.use(express.static('./www')); // статический файлсервер

// Использование транспортов
const routes = fs.find('routes', { recursive: true, matching: ['*.js'] });
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

app.listen(80, () => {
	console.log('ZeroCore started and listening on port 80');
});