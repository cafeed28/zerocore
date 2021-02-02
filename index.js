const fc = require('fancy-console');
const utils = require('./lib/utils');

const urlparser = require('url');
const { StatusCodes } = require('http-status-codes');

let { basePath, bannedIps, port } = require('./config');
basePath += '/';

const endpoints = new Map();

function find(map, fn) {
	if (typeof fn !== 'function') return undefined;

	for (const [key, val] of map) {
		if (fn(val, key)) return val;
	}
	return undefined;
}

console.log('Подключенные модули:\n');

const endpointFiles = require('fs-readdir-recursive')('./endpoints').filter(file => file.endsWith('.js'));
for (const file of endpointFiles) {
	const endpoint = require(`./endpoints/${file}`);
	endpoints.set(endpoint.path, endpoint);
	console.log(endpoint.path);
}

process.on('unhandledRejection', (error) => fc.error(`Uncaught Promise Rejection\n${error}\n${error.stack}`));

const { mongoose } = require('./mongoose');

const app = require('express')();
const bodyParser = require('body-parser');

app.use(bodyParser.raw());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use(async (req, res, next) => {
	const ip = req.ip.substring(7);
	if (bannedIps.find(i => i == ip)) {
		console.log(`${ip} banned`);
		res.status(444);
		return next();
	}

	// url
	let url = urlparser.parse(req.url).pathname;
	if (url.charAt(0) == "/") url = url.substring(1);
	if (url.charAt(url.length - 1) == "/") url = url.substring(0, url.length - 1);
	if (url.startsWith(basePath)) url = url.substring(basePath.length);

	// log
	console.log(`\n[${req.method.toUpperCase()}]`, url);
	console.log(`\nIP: ${ip}, Content-type: ${req.headers['content-type']}`);
	console.log(`Body:\n`, req.body);

	const endpoint = endpoints.get(url) || find(endpoints, endpoint => endpoint.aliases && endpoint.aliases.includes(url));

	if (!endpoint) {
		fc.error(`${url}: 404`);
		return res.sendStatus(StatusCodes.NOT_FOUND);
	}

	if (!utils.checkKeys(req.body, endpoint.requiredKeys)) {
		fc.error('Request must have these keys:\n' + endpoint.requiredKeys.join(', '));
		res.send('-1');
		return next();
	}

	try {
		await endpoint.execute(req, res, req.body, mongoose.models);
	} catch (e) {
		fc.error(e.stack);
		return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
	}
	next();
});

mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost:27017/zerocore', { useNewUrlParser: true, useUnifiedTopology: true }).then(async (client) => {
	global.server = client.models;
}).catch((err) => {
	return fc.error('MongoDB Error:\n', err);
});

app.listen(port, () => fc.success('\nzeroCore запустился и работает на 80 порту'));