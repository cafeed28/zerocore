const fc = require('fancy-console');
const { check } = require('../../lib/gjpcheck');

module.exports = {
	path: 'likeGJItem211.php',
	aliases: ['likeGJItem211'],
	requiredKeys: ['gjp', 'accountID', 'itemID', 'like', 'type'],
	async execute(req, res, body, server) {
		const gjp = body.gjp;
		const accountID = body.accountID;
		const type = body.type;
		const itemID = body.itemID;

		if (check(gjp, accountID)) {
			let item;

			if (type == 1) {
				item = await server.levels.findOne({ levelID: itemID });
			} else if (type == 2) {
				item = await server.comments.findOne({ commentID: itemID });
			} else if (type == 3) {
				item = await server.posts.findOne({ postID: itemID });
			} else {
				fc.error(`Лайк на предмет типа ${type} с ID ${itemID} не поставлен: неизвестный тип`);
				return res.send('-1');
			}

			if (!item) {
				fc.error(`Лайк на предмет типа ${type} с ID ${itemID} не поставлен: предмет не найден`);
				return res.send('-1');
			}

			let likes = item.likes;
			if (body.like == 1) likes++;
			else likes--;

			await item.updateOne({ likes: likes });

			fc.success(`Лайк на предмет типа ${type} с ID ${itemID} поставлен`);
			return res.send('1');
		} else {
			fc.error(`Лайк на предмет типа ${type} с ID ${itemID} не поставлен: ошибка авторизации`);
			return res.send('-1');
		}
	}
}