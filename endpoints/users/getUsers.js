const fc = require('fancy-console');
const bcrypt = require('bcrypt');
const { remove } = require('../../lib/exploitPatch');
const { check } = require('../../lib/gjpcheck');
const utils = require('../../lib/utils');

module.exports = {
    path: 'getGJUsers20.php',
    aliases: ['getGJUsers20'],
    requiredKeys: ['page', 'str'],
    async execute(req, res, body, server) {
        const page = body.page;

        let usersString = '';

        const users = await server.users.find({ userName: new RegExp(body.str, 'i') });

        if (!users.length) {
            fc.error(`Получение пользователей не выполнено: пользователи не найдены`);
            return '-1';
        } else {
            users.map(user => {
                usersString += utils.jsonToRobtop([{
                    '1': user.userName,
                    '2': user.accountID,
                    '3': user.stars,
                    '4': user.demons,
                    '8': user.creatorPoints,
                    '9': user.accIcon,
                    '10': user.color1,
                    '11': user.color2,
                    '13': user.coins,
                    '14': user.iconType,
                    '15': user.special,
                    '16': user.accountID,
                    '17': user.userCoins
                }]) + '|';
            });
        }
        fc.success(`Получение пользователей выполнено`);

        console.log(usersString.slice(0, -1) + `#${users.length}:${page}:10`);

        return usersString.slice(0, -1) + `#${users.length}:${page}:10`;
    }
};