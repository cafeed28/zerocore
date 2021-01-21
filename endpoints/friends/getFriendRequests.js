const fc = require('fancy-console');
const utils = require('../../lib/utils');

module.exports = {
    path: 'getGJFriendRequests20.php',
    aliases: ['getGJFriendRequests20'],
    requiredKeys: ['accountID', 'page'],
    async execute(req, res, body, server) {
        const accountID = body.accountID;
        const page = body.page;
        const getSent = body.getSent || 0;

        let requestsString = '';

        let requests;
        if (getSent == 1) {
            requests = await server.friendrequests.find({ fromAccountID: accountID }).skip(page * 10).limit(10);
        } else {
            requests = await server.friendrequests.find({ toAccountID: accountID }).skip(page * 10).limit(10);
        }

        if (!requests) {
            fc.error(`Запросы в друзья аккаунту ${accountID} не получены: запросы не найдены`);
            return '-1';
        } else {
            // робтоп я тебя ненавижу...

            await Promise.all(requests.map(async(request) => {
                let dateAgo = moment(post.uploadDate).fromNow(true);

                const user = await server.users.findOne({
                    accountID: getSent == 1 ? request.toAccountID : request.fromAccountID
                });

                requestsString += utils.jsonToRobtop([{
                    '1': user.userName,
                    '2': user.accountID,
                    '3': user.accIcon,
                    '10': user.color1,
                    '11': user.color2,
                    '14': user.iconType,
                    '15': user.special,
                    '17': user.userCoins,
                    '16': user.accountID,
                    '32': request.requestID,
                    '35': request.message,
                    '37': dateAgo,
                    '41': request.isUnread
                }]) + '|';
            }));
            fc.success(`Запросы в друзья аккаунту ${accountID} получены`);

            return requestsString + `#${requests.length}:${page * 10}:10`;
        }
    }
}