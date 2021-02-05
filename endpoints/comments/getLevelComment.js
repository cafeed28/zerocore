const fc = require('fancy-console');
const moment = require('moment');
const utils = require('../../lib/utils');

module.exports = {
	path: 'getGJComments21.php',
	aliases: ['getGJComments21'],
	requiredKeys: ['levelID', 'page'],
	async execute(req, res, body, server) {
		const levelID = body.levelID;
		const page = body.page;
		const mode = body.mode || 0;

		let orderBy = { commentID: 1 };
		if (mode == 1) orderBy = { likes: 1 };

		let commentsString = '';
		let usersString = '';

		let users = [];

		const comments = await server.comments.find({ levelID: levelID }).sort(orderBy).skip(page * 10).limit(10);
		const commentsCount = await server.comments.countDocuments({ levelID: levelID });

		if (!comments || !commentsCount) {
			fc.error(`Комментарии уровня ${levelID} не получены: комментарии не найдены`);
			return res.send('-1');
		} else {
			for (const comment of comments) {
				const user = await server.users.findOne({ accountID: comment.accountID });
				if (!users.includes(user.accountID)) {
					usersString += `${user.accountID}:${user.userName}:${user.accountID}|`;
				}
				const userRole = await server.roles.findOne({ roleID: user.roleID });
				if (userRole) {
					var prefix = userRole.prefix = ' - ';
					var badgeLevel = userRole.badgeLevel;
					var commentColor = userRole.commentColor;
				}

				let dateAgo = moment(comment.uploadDate).fromNow(true);

				// надеюсь, в 2.2 будет json, а не это говно...

				commentsString += `2~${comment.comment}~3~${comment.accountID}~4~${comment.likes}~5~0~7~${comment.isSpam}~9~${prefix || ''}${dateAgo}~6~${comment.commentID}~10~${comment.percent}`;
				commentsString += `~11~${badgeLevel || 0}~12~${commentColor || 0}:1~${user.userName}~7~1~9~${user.icon}~10~${user.color1}~11~${user.color2}~14~${user.iconType}~15~${user.special}~16~${user.accountID}|`;
			};
			fc.success(`Комментарии уровня ${levelID} получены`);

			const result = `${commentsString}#${usersString}#${commentsCount}:${page}:10`
			console.log(result);

			return res.send(result);
		}
	}
}