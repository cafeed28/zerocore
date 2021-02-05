const fc = require('fancy-console');
const brcypt = require('bcrypt');
const { translitCyrillic } = require('../../../lib/apiLib');

module.exports = {
	path: 'api/roles/addjkngfdfv==',
	aliases: [],
	requiredKeys: ['roleName', 'userName', 'password'],
	async execute(req, res, body, server) {
		const roleName = translitCyrillic(body.roleName);
		const user = await server.accounts.findOne({ userName: body.userName });

		if (!await brcypt.compare(body.password, user.password)) {
			fc.error(`Роль ${roleName} не создана: ошибка авторизации`);
			return res.json({
				'status': 'error',
				'code': 'loginFailed'
			});
		}

		const freeCopy = body.freeCopy || 0;
		const rateLevel = body.rateLevel || 0;
		const rateLevelStar = body.rateLevelStar || 0;
		const rateLevelStarFeatured = body.rateLevelStarFeatured || 0;
		const rateLevelStarEpic = body.rateLevelStarEpic || 0;
		const rateLevelStarDemon = body.rateLevelStarDemon || 0;

		const moveLevelAcc = body.moveLevelAcc || 0;
		const changeLevelDesc = body.changeLevelDesc || 0;

		const badgeLevel = body.badgeLevel || 0;

		const commentColor = body.commentColor || '255,255,255';
		const prefix = body.prefix || '';

		const checkRole = await server.roles.findOne({
			roleName: roleName
		});

		if (checkRole) {
			fc.error(`Роль ${roleName} не создана: такая роль уже есть`);
			return res.json({
				'status': 'error',
				'code': 'alreadyCreated',
				'value': checkRole.roleID
			});
		} else {
			const role = new server.roles({
				roleName: roleName,
				roleID: (await server.roles.countDocuments()) + 1,

				freeCopy: freeCopy,
				rateLevel: rateLevel,
				rateLevelStar: rateLevelStar,
				rateLevelStarFeatured: rateLevelStarFeatured,
				rateLevelStarEpic: rateLevelStarEpic,
				rateLevelStarDemon: rateLevelStarDemon,

				moveLevelAcc: moveLevelAcc,
				changeLevelDesc: changeLevelDesc,

				badgeLevel: badgeLevel,

				commentColor: commentColor,
				prefix: prefix,
			});

			role.save();

			fc.success(`Роль ${roleName} создана`);
			return res.json({
				'status': 'success',
				'value': role.roleID
			});
		}
	}
}