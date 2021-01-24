const fc = require('fancy-console');
const urlparser = require('url');
const utils = require('./lib/utils');

const path = 'zerocoredatabase/';

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

app.use(async(req, res, next) => {
    let url = urlparser.parse(req.url).pathname;
    if (url.charAt(0) == "/") url = url.substring(1);
    if (url.charAt(url.length - 1) == "/") url = url.substring(0, url.length - 1);

    if (url.startsWith(path)) url = url.substring(path.length);

    if (url == 'favicon.ico') return next();

    console.log(`\n[${req.method.toUpperCase()}]`, url);
    console.log(`Body:\n`, req.body);

    const endpoint = endpoints.get(url) ||
        find(endpoints, endpoint => endpoint.aliases && endpoint.aliases.includes(url));

    if (!endpoint) {
        fc.error(`endpoint по адресу ${url} не найден`);
        return res.send('-1\n' + url + ' endpoint not found');
    }

    const checkBody = utils.checkKeys(req.body, endpoint.requiredKeys);
    const checkQuery = utils.checkKeys(req.query, endpoint.requiredKeys);
    let body;

    if (!checkBody && !checkQuery) {
        fc.error('Запрос не имеет необходимых ключей:\n' + endpoint.requiredKeys.join(', '));
        res.send('-1');
        return next();
    }

    body = checkBody ? req.body : req.query;

    try {
        const result = await endpoint.execute(req, res, body, mongoose.models);
        res.send(result);
    } catch (e) {
        fc.error(e.stack);
        res.send('-1\n' + e);
    }
    next();
});

app.all('/', (req, res, next) => {
    res.send('zeroCore работает');
    next();
});

mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost:27017/zerocore', { useNewUrlParser: true, useUnifiedTopology: true }).then(async(client) => {
    global.server = client.models;
}).catch((err) => {
    return fc.error('MongoDB Error:\n', err);
});

app.listen(80, () => fc.success('\nzeroCore запустился и работает на 80 порту'));