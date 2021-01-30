const fc = require('fancy-console');

module.exports = {
    path: '',
    aliases: ['index', 'index'],
    requiredKeys: [],
    async execute(req, res, body, server) {
        return 'zeroCore запущен';
    }
}