import express from 'express';
const app = express.Router();

import fc from 'fancy-console';
import config from '../../config';

import axios from 'axios';

import WebHelper from '../../helpers/classes/WebHelper';
import APIHelpers from '../../helpers/classes/API';
import GJHelpers from '../../helpers/classes/GJHelpers';

import { MapPackModel, IMapPack } from '../../helpers/models/mappacks';
import { GauntletModel, IGauntlet } from '../../helpers/models/gauntlet';
import { AccountModel } from '../../helpers/models/account';
import EPermissions from '../../helpers/EPermissions';

app.get(`/${config.basePath}/api/mappacks`, async (req: any, res: any) => {
	let packsList: any[] = [];

	const packs = await MapPackModel.find();
	packs.map(pack => {
		packsList.push(pack);
	});

	return res.send({
		'status': 'success',
		'value': packsList
	});
});

app.post(`/${config.basePath}/api/mappacks`, async (req: any, res: any) => {
	const requredKeys = ['packName', 'userName', 'password', 'levels'];
	const body = req.body;
	if (!WebHelper.checkRequired(body, requredKeys, res)) return;

	const packName = APIHelpers.translitCyrillic(body.packName).trim();

	const userName = body.userName.trim();
	const password = body.password.trim();

	if (!await GJHelpers.isValid(userName, password)) {
		fc.error(`Маппак ${packName} не создан: ошибка аутентификации (${userName})`);
		return res.send({
			'status': 'error',
			'code': 'authError'
		})
	}

	const account = await AccountModel.findOne({
		userName: userName
	});
	if (await GJHelpers.getAccountPermission(account.accountID, EPermissions.badgeLevel) != 2) {
		fc.error(`Маппак не создан: нет прав (${userName})`);
		return res.send({
			'status': 'error',
			'code': 'permError'
		})
	}

	if (packName == '') {
		fc.error(`Маппак не создан: пустое название`);
		return res.send({
			'status': 'error',
			'code': 'emptyName'
		})
	}

	const checkPack = await MapPackModel.findOne({
		packName: new RegExp(packName, 'i')
	});

	if (checkPack) {
		fc.error(`Маппак не создан: маппак с таким названием уже есть, ID: ${checkPack.packID}`);
		return res.send({
			'status': 'error',
			'code': 'alreadyCreated',
			'value': checkPack.packID
		})
	} else {
		const levels = body.levels.trim();
		const stars = body.stars.trim();
		const coins = body.coins.trim();
		const difficulty = body.difficulty.trim();
		const color = body.color.trim();
		const colors2 = body.colors2.trim();

		const pack: IMapPack = {
			packID: (await MapPackModel.find({}).sort({ _id: -1 }).limit(1))[0].packID + 1,
			packName: packName,
			levels: levels,
			stars: stars,
			coins: coins,
			difficulty: difficulty,
			color: color,
			colors2: colors2
		};

		await MapPackModel.create(pack);

		axios.post(config.webhook, {
			"content": null,
			"embeds": [
				{
					"title": `MapPack Created by ${userName}`,
					"color": 3715756,
					"fields": [
						{
							"name": `${packName}`,
							"value": `${pack.packID}`
						}
					],
					"footer": {
						"text": "ZeroCore Webhook"
					},
					"timestamp": new Date().toISOString()
				}
			]
		});

		fc.success(`Маппак ${packName} создан`);
		return res.send({
			'status': 'success',
			'value': pack.packID
		})
	}
});

app.get(`/${config.basePath}/api/packs/:id`, async (req: any, res: any) => {
	const body = req.body;
	let songList: any[] = [];
});

app.get(`/${config.basePath}/api/gauntlets`, async (req: any, res: any) => {
	let packsList: any[] = [];

	const packs = await MapPackModel.find();
	packs.map(pack => {
		packsList.push(pack);
	});

	return res.send({
		'status': 'success',
		'value': packsList
	})
});

app.post(`/${config.basePath}/api/gauntlets`, async (req: any, res: any) => {
	const requredKeys = ['userName', 'password', 'levels'];
	const body = req.body;
	if (!WebHelper.checkRequired(body, requredKeys, res)) return;

	const userName = body.userName.trim();
	const password = body.password.trim();

	if (!await GJHelpers.isValid(userName, password)) {
		fc.error(`Гаунтлет не создан: ошибка аутентификации (${userName})`);
		return res.send({
			'status': 'error',
			'code': 'authError'
		})
	}

	const levels = body.levels.trim().split(',');
	if (levels.length < 5) {
		fc.error(`Гаунтлет не создан: необходимо 5 уровней`);
		return res.send({
			'status': 'error',
			'code': 'minimalLevelsCount',
			'value': levels.length
		})
	}

	const pack: IGauntlet = {
		packID: (await GauntletModel.find({}).sort({ _id: -1 }).limit(1))[0].packID + 1,
		levelID1: levels[0],
		levelID2: levels[1],
		levelID3: levels[2],
		levelID4: levels[3],
		levelID5: levels[4]
	};

	await GauntletModel.create(pack);

	axios.post(config.webhook, {
		"content": null,
		"embeds": [
			{
				"title": `Gauntled Created by ${userName}`,
				"color": 3715756,
				"fields": [
					{
						"name": "Gauntlet",
						"value": `${pack.packID}`
					}
				],
				"footer": {
					"text": "ZeroCore Webhook"
				},
				"timestamp": new Date().toISOString()
			}
		]
	});

	fc.success(`Гаунтлет ${pack.packID} создан`);
	return res.send({
		'status': 'success',
		'value': pack.packID
	})
});

app.get(`/${config.basePath}/api/gauntlets/:id`, async (req: any, res: any) => {
	const body = req.body;
	let songList: any[] = [];
});

export { app as router };