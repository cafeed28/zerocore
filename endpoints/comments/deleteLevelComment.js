const fc = require('fancy-console');
const { check } = require('../../lib/gjp');

module.exports = {
	path: 'deleteGJComment20.php',
	aliases: ['deleteGJComment20'],
	requiredKeys: ['gjp', 'commentID', 'levelID', 'accountID', 'secret'],
	async execute(req, res, body, server) {
		const gjp = body.gjp;
		const levelID = body.levelID;
		const accountID = body.accountID;
		const commentID = body.commentID;

		if (check(gjp, accountID)) {
			const comment = await server.comments.deleteOne({
				commentID: commentID
			});

			if (comment.deletedCount == 0) {
				fc.error(`Комментарий с уровня ${levelID} не удален: пост не найден`);
				return res.send('-1');
			} else {
				fc.success(`Комментарий с уровня ${levelID} удален`);
				return res.send('1');
			}

		} else {
			fc.error(`Комментарий с уровня ${levelID} не удален: ошибка авторизации`);
			return res.send('-1');
		}
	}
}