const fc = require('fancy-console');
const moment = require('moment');

module.exports = {
	path: 'getGJAccountComments20.php',
	aliases: ['getGJAccountComments20'],
	requiredKeys: ['accountID', 'page'],
	async execute(req, res, body, server) {
		const accountID = body.accountID;
		const page = body.page;

		let postsString = '';

		const posts = await server.posts.find({ accountID: accountID }).sort({ uploadDate: -1 }).skip(page * 10).limit(10);
		const postsCount = await server.posts.countDocuments({ accountID: accountID });

		if (!posts || !postsCount) {
			fc.error(`Посты аккаунта ${accountID} не получены: посты не найдены`);
			return res.send('#0:0:0');
		} else {
			posts.map(post => {
				let dateAgo = moment(post.uploadDate).fromNow(true);

				// робтоп я тебя ненавижу...
				postsString += `2~${post.post}~3~${post.accountID}~4~${post.likes}~5~0~7~${post.isSpam}~9~${dateAgo}~6~${post.postID}|`;
			});
			fc.success(`Посты аккаунта ${accountID} получены`);

			return res.send(postsString + `#${postsCount}:${page}:10`);
		}
	}
}