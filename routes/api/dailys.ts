import express from 'express';
const app = express.Router();

import fc from 'fancy-console';
import config from '../../config';

import axios from 'axios';

import WebHelper from '../../helpers/classes/WebHelper';
import GJHelpers from '../../helpers/classes/GJHelpers';

import { DailyModel, IDaily } from '../../helpers/models/daily';
import { LevelModel } from '../../helpers/models/level';
import { AccountModel } from '../../helpers/models/account';
import EPermissions from '../../helpers/EPermissions';

app.get(`/${config.basePath}/api/daily`, async (req: any, res: any) => {
	const d = Math.round(new Date().getTime() / 1000);

	const daily = await DailyModel.findOne({
		timestamp: {
			$lt: d
		},
		type: 0
	});

	const weekly = await DailyModel.findOne({
		timestamp: {
			$lt: d
		},
		type: 1
	});

	return res.json({
		'status': 'success',
		'value': {
			'daily': daily,
			'weekly': weekly
		}
	});
});

app.post(`/${config.basePath}/api/daily`, async (req: any, res: any) => {
	const requredKeys = ['levelID', 'type', 'userName', 'password'];
	const body = req.body;
	if (!WebHelper.checkRequired(body, requredKeys, res)) return;

	const userName = body.userName.trim();
	const password = body.password.trim();
	if (!await GJHelpers.isValid(userName, password)) {
		fc.error(`Дейли не назначен: ошибка аутентификации (${userName})`);
		return res.json({
			'status': 'error',
			'code': 'authError'
		})
	}

	const account = await AccountModel.findOne({
		userName: userName
	});
	if (await GJHelpers.getAccountPermission(account.accountID, EPermissions.badgeLevel) != 2) {
		fc.error(`Делйи не назначен: нет прав (${userName})`);
		return res.json({
			'status': 'error',
			'code': 'permError'
		})
	}

	const levelID = body.levelID;
	let type = body.type;

	if (levelID == '') {
		fc.error(`Дейли не назначен: пустой ID`);
		return res.json({
			'status': 'error',
			'code': 'emptyName'
		})
	}

	if (type != 0 && type != 1) {
		fc.error(`Дейли не назначен: тип может быть только 0 и 1`);
		return res.json({
			status: 'error',
			code: 'dailyOrWeeklyOnly'
		})
	}

	const checkDaily = await DailyModel.findOne({
		levelID: levelID
	});

	if (checkDaily) {
		fc.error(`Дейли не назначен: этот уровень уже назначен`);
		return res.json({
			'status': 'error',
			'code': 'alreadyUploaded'
		})
	} else {
		const level = await LevelModel.findOne({ levelID: levelID });

		if (!level) {
			fc.error(`Дейли не назначен: такого уровня нет`);
			return res.json({
				'status': 'error',
				'value': 'levelNotFound'
			});
		}

		const daily: IDaily = {
			levelID: levelID,
			timestamp: Math.round(new Date().getTime() / 1000),
			type: type,
			feaID: (await DailyModel.countDocuments()) + 1
		};

		await DailyModel.create(daily);

		axios.post(config.webhook, {
			"content": null,
			"embeds": [
				{
					"title": `Daily Appointed by ${userName}`,
					"color": 3715756,
					"fields": [
						{
							"name": `${level.levelName}, ID: ${levelID}`,
							"value": `Type: ${type}`
						}
					],
					"footer": {
						"text": "ZeroCore Webhook"
					},
					"timestamp": new Date().toISOString()
				}
			]
		});

		fc.success(`Дейли ${level.levelName} с ID ${levelID} назначен (${userName})`);
		return res.json({
			'status': 'success',
			'value': levelID
		});
	}
});

export { app as router };