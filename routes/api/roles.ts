import fc from 'fancy-console';
import config from '../../config';

import express from 'express';
import axios from 'axios';

import Mongoose from '../../helpers/Mongoose';
import Express from '../../helpers/Express';

import APIHelpers from '../../helpers/API';
import GJHelpers from '../../helpers/GJHelpers';

const router = express.Router();

router.get('/api/roles', async (req, res) => {
	let rolesList: any[] = [];

	const roles = await Mongoose.roles.find();
	roles.map(role => {
		rolesList.push(role);
	});

	return res.json({
		'status': 'success',
		'value': rolesList
	});
});

router.post('/api/roles', async (req, res) => {
	const requredKeys = ['roleName', 'userName', 'password'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	const roleName = APIHelpers.translitCyrillic(body.roleName).trim();
	const download = body.download.trim();

	if (roleName == '') {
		fc.error(`Роль не создана: пустое название`);
		return res.json({
			'status': 'error',
			'code': 'emptyName'
		});
	}

	const userName = body.userName.trim();
	const password = body.password.trim();
	if (!GJHelpers.isValid(userName, password)) {
		fc.error(`Роль ${roleName} не создана: ошибка аутентификации (${userName})`);
		return res.json({
			'status': 'error',
			'code': 'authError'
		})
	}

	const checkRole = await Mongoose.roles.findOne({
		roleName: new RegExp(roleName, 'i')
	});

	if (checkRole) {
		fc.error(`Роль не создана: роль с таким названием уже есть, ID: ${checkRole.roleID}`);
		return res.json({
			'status': 'error',
			'code': 'alreadyUploaded',
			'value': checkRole.roleID
		});
	} else {
		const role = new Mongoose.roles({
			roleID: (await Mongoose.roles.countDocuments()) + 1,
			roleName: roleName,

			// i know, unreadable
			freeCopy: APIHelpers.clamp(parseInt(body.freeCopy), 0, 1),
			rateLevel: APIHelpers.clamp(parseInt(body.rateLevel), 0, 1),
			rateLevelStar: APIHelpers.clamp(parseInt(body.rateLevelStar), 0, 1),
			rateLevelStarFeatured: APIHelpers.clamp(parseInt(body.rateLevelStarFeatured), 0, 1),
			rateLevelStarEpic: APIHelpers.clamp(parseInt(body.rateLevelStarEpic), 0, 1),
			rateLevelStarDemon: APIHelpers.clamp(parseInt(body.rateLevelStarDemon), 0, 1),

			moveLevelAcc: APIHelpers.clamp(parseInt(body.moveLevelAcc), 0, 1),
			changeLevelDesc: APIHelpers.clamp(parseInt(body.changeLevelDesc), 0, 1),

			badgeLevel: APIHelpers.clamp(parseInt(body.badgeLevel), 0, 2),

			commentColor: body.commentColor || '255,255,255',
			prefix: body.prefix || ''
		});

		role.save();

		axios.post(config.webhook, {
			"content": null,
			"embeds": [
				{
					"title": `Role Created by ${userName}`,
					"color": 5814783,
					"fields": [
						{
							"name": `${roleName}`,
							"value": `${role.roleID}`
						}
					],
					"footer": {
						"text": "ZeroCore Webhook"
					},
					"timestamp": new Date().toISOString()
				}
			]
		});

		fc.success(`Роль ${roleName} создана`);
		return res.json({
			'status': 'success',
			'value': role.roleID
		});
	}
});

router.get('/api/roles/:id', async (req, res) => {
	const body = req.body;
	let songList: any[] = [];
});

export { router };