import fc from 'fancy-console';
import config from '../../config';

import axios from 'axios';

import WebHelper from '../../helpers/classes/WebHelper';
import APIHelpers from '../../helpers/classes/API';
import GJHelpers from '../../helpers/classes/GJHelpers';

import { QuestModel, IQuest } from '../../helpers/models/quest';
import { GauntletModel, IGauntlet } from '../../helpers/models/gauntlet';

async function router(router: any, options: any) {
	router.get(`/${config.basePath}/api/quests`, async (req: any, res: any) => {
		let questsList: any[] = [];

		const quests = await QuestModel.find();
		quests.map(quest => {
			questsList.push(quest);
		});

		return {
			'status': 'success',
			'value': questsList
		};
	});

	router.post(`/${config.basePath}/api/quests`, async (req: any, res: any) => {
		const requredKeys = ['questName', 'userName', 'password', 'type', 'amount', 'reward'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const questName = APIHelpers.translitCyrillic(body.questName).trim();

		const userName = body.userName.trim();
		const password = body.password.trim();

		if (!GJHelpers.isValid(userName, password)) {
			fc.error(`Квест ${questName} не создан: ошибка аутентификации (${userName})`);
			return {
				'status': 'error',
				'code': 'authError'
			}
		}

		if (questName == '') {
			fc.error(`Квест не создан: пустое название`);
			return {
				'status': 'error',
				'code': 'emptyName'
			};
		}

		const checkPack = await QuestModel.findOne({
			questName: new RegExp(questName, 'i')
		});

		if (checkPack) {
			fc.error(`Квест не создан: квест с таким названием уже есть, ID: ${checkPack.questID}`);
			return {
				'status': 'error',
				'code': 'alreadyCreated',
				'value': checkPack.questID
			};
		} else {
			const type = body.type.trim();
			const amount = body.amount.trim();
			const reward = body.reward.trim();

			const quest: IQuest = {
				questID: (await QuestModel.countDocuments()) + 1,
				questName: questName,
				type: type,
				amount: amount,
				reward: reward
			};

			await QuestModel.create(quest);

			axios.post(config.webhook, {
				"content": null,
				"embeds": [
					{
						"title": `Quest Created by ${userName}`,
						"color": 3715756,
						"fields": [
							{
								"name": `${questName}`,
								"value": `${quest.questID}`
							}
						],
						"footer": {
							"text": "ZeroCore Webhook"
						},
						"timestamp": new Date().toISOString()
					}
				]
			});

			fc.success(`Квест ${questName} создан`);
			return {
				'status': 'success',
				'value': quest.questID
			};
		}
	});

	router.get(`/${config.basePath}/api/quests/:id`, async (req: any, res: any) => {
		const body = req.body;
		let songList: any[] = [];
	});
}

export { router };