const fc = require('fancy-console');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = {
    path: 'getGJAccountComments20.php',
    aliases: ['getGJAccountComments20'],
    requiredKeys: ['accountID', 'page'],
    async execute(req, res, body, server) {
        const accountID = body.accountID;
        const page = body.page;

        let postsString = '';

        const posts = await server.posts.find({ accountID: accountID }).skip(page * 10).limit(10);

        if (!posts) {
            fc.error(`Посты аккаунта ${accountID} не получены: посты не найдены`);
            return '-1';
        } else {
            // робтоп я тебя ненавижу...
            // ну раз робтоп не сделал понятные ответы, напишу комментарий я
            // 2~post~3~accountID~4~likes~5~idk~7~isSpam~9~dateAgo~6~postID|#commentCount:commentPage:idk

            posts.map(post => {
                let dateAgo = moment(post.uploadDate).fromNow(true);

                postsString += `2~${post.post}~3~${post.accountID}~4~${post.likes}~5~0~7~${post.isSpam}~9~${dateAgo}~6~${post.postID}|`;
            });
        }
        fc.success(`Посты аккаунта ${accountID} получены`);

        return postsString + `#${posts.length}:${page}:10`;
    }
};