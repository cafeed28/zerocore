const fc = require('fancy-console');
const { check } = require('../../lib/gjpcheck');

module.exports = {
	path: 'uploadGJAccComment20.php',
	aliases: ['uploadGJAccComment20'],
	requiredKeys: ['gjp', 'userName', 'comment', 'accountID', 'secret'],
	async execute(req, res, body, server) {
		const gjp = body.gjp;
		const userName = body.userName;
		const comment = body.comment;
		const accountID = body.accountID;

		if (check(gjp, accountID)) {
			const post = new server.posts({
				userName: userName,
				post: comment,
				accountID: accountID,
				uploadDate: Date.now(),
				postID: (await server.posts.find()).sort({ _id: -1 }).limit(1).postID + 1
			});
			post.save();

			fc.success(`Пост на аккаунте ${body.userName} создан`);
			return res.send('1');
		} else {
			fc.error(`Пост на аккаунте ${body.userName} не создан: ошибка авторизации`);
			return res.send('-1');
		}
	}
}