import fc from 'fancy-console';
import config from '../../config';

import axios from 'axios';

import Mongoose from '../../helpers/classes/Mongoose';
import WebHelper from '../../helpers/classes/WebHelper';

import GJHelpers from '../../helpers/classes/GJHelpers';

async function router(router: any, options: any) {
	router.get(`/${config.basePath}/api/daily`, async (req: any, res: any) => {
		const d = new Date();

		const daily = await Mongoose.dailys.findOne({
			timestamp: {
				$lt: d
			},
			type: 0
		});

		const weekly = await Mongoose.dailys.findOne({
			timestamp: {
				$lt: d
			},
			type: 1
		});

		return {
			'status': 'success',
			'value': {
				'daily': daily,
				'weekly': weekly
			}
		};
	});

	router.post(`/${config.basePath}/api/daily`, async (req: any, res: any) => {
		const requredKeys = ['levelID', 'type', 'userName', 'password'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const userName = body.userName.trim();
		const password = body.password.trim();
		if (!GJHelpers.isValid(userName, password)) {
			fc.error(`Дейли не назначен: ошибка аутентификации (${userName})`);
			return {
				'status': 'error',
				'code': 'authError'
			}
		}

		const levelID = body.levelID;
		let type = body.type;

		if (levelID == '') {
			fc.error(`Дейли не назначен: пустой ID`);
			return {
				'status': 'error',
				'code': 'emptyName'
			};
		}

		if (type != 'daily' && type != 'weekly') {
			fc.error(`Дейли не назначен: тип может быть только 'daily' и 'weekly'`);
			return {
				status: 'error',
				code: 'dailyOrWeeklyOnly'
			}
		}

		const checkDaily = await Mongoose.dailys.findOne({
			levelID: levelID
		});

		if (checkDaily) {
			fc.error(`Дейли не назначен: этот уровень уже назначен`);
			return {
				'status': 'error',
				'code': 'alreadyUploaded'
			};
		} else {
			const level = await Mongoose.levels.findOne({ levelID: levelID });

			if (!level) {
				fc.error(`Дейли не назначен: такого уровня нет`);
				return {
					'status': 'error',
					'value': 'levelNotFound'
				};
			}

			let numType;
			if (type == 'daily') numType = 0;
			if (type == 'weekly') numType = 1;

			const daily = new Mongoose.dailys({
				levelID: levelID,
				timestamp: Math.round(new Date().getTime() / 1000),
				type: numType
			});

			daily.save();

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
			return {
				'status': 'success',
				'value': levelID
			};
		}
	});
}

export { router };