const fc = require('fancy-console');
const { check } = require('../../lib/gjpcheck');

module.exports = {
	path: 'uploadGJComment21.php',
	aliases: ['uploadGJComment21'],
	requiredKeys: ['gjp', 'userName', 'accountID', 'levelID', 'comment', 'secret'],
	async execute(req, res, body, server) {
		const gjp = body.gjp;
		const userName = body.userName;
		const accountID = body.accountID;
		const levelID = body.levelID;
		const commentStr = body.comment;
		const percent = body.percent || 0;

		if (check(gjp, levelID)) {
			const comment = new server.comments({
				userName: userName,
				comment: commentStr,
				levelID: levelID,
				accountID: accountID,
				percent: percent,
				uploadDate: Date.now(),
				commentID: (await server.comments.find().sort({ _id: -1 }).limit(1)).commentID + 1
			});
			comment.save();

			fc.success(`Комментарий на уровне ${levelID} создан`);
			return res.send('1');
		} else {
			fc.error(`Комментарий на уровне ${levelID} не создан: ошибка авторизации`);
			return res.send('-1');
		}
	}
}