import fc from 'fancy-console';

import Mongoose from '../helpers/classes/Mongoose';
import WebHelper from '../helpers/classes/WebHelper';

import GJCrypto from '../helpers/classes/GJCrypto';
import config from '../config';

async function router(router: any, options: any) {
	router.post(`/${config.basePath}/deleteGJMessages20.php`, async (req: any, res: any) => {
		const requredKeys = ['messageID', 'accountID', 'gjp'];
		const body = req.body;
		if (!WebHelper.checkKeys(body, requredKeys)) {
			fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
			return res.code(400).send('-1');
		}

		const gjp = body.gjp;
		const accountID = body.accountID;
		let messageID = body.messageID;
		let messages = body.messages;

		if (GJCrypto.gjpCheck(gjp, accountID)) {
			if (messages) {
				messages = messages.replace(/[^0-9,]/, '').split(',');
				var limit = 10;
			}
			else {
				messages = messageID;
				var limit = 1;
			}

			await Mongoose.messages.find({
				messageID: {
					$in: messages
				},
				senderID: accountID
			}).limit(limit).deleteMany();

			await Mongoose.messages.find({
				messageID: {
					$in: messages
				},
				recipientID: accountID
			}).limit(limit).deleteMany();

			fc.success(`Удаление сообщений ${messages} выполнено`);
			return '1';
		} else {
			fc.error(`Удаление сообщений ${messages} не выполнено: ошибка авторизации`);
			return '-1';
		}
	});

	router.post(`/${config.basePath}/deleteGJMessages20.php`, async (req: any, res: any) => {
		const requredKeys = ['messageID', 'accountID', 'gjp'];
		const body = req.body;
		if (!WebHelper.checkKeys(body, requredKeys)) {
			fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
			return res.code(400).send('-1');
		}

		const gjp = body.gjp;
		let accountID = body.accountID;
		let messageID = body.messageID;
		let isSender = body.isSender;

		if (GJCrypto.gjpCheck(gjp, accountID)) {
			let message = await Mongoose.messages.findOne({
				messageID: messageID,
				$or: [{
					senderID: accountID,
					recipientID: accountID
				}]
			});

			if (!message) {
				fc.error(`Удаление сообщения ${messageID} не выполнено: сообщение не найдено`);
				return '-1';
			}

			if (isSender) {
				await Mongoose.messages.updateOne({
					messageID: messageID,
					recipientID: accountID
				}, {
					isNew: 1
				});

				accountID = message.senderID;
				isSender = 0;
			} else {
				isSender = 1;
				accountID = message.recipientID;
			}

			let user = await Mongoose.users.findOne({ accountID: accountID });

			fc.success(`Скачивание сообщения ${messageID} выполнено`);
			return `6:${user.userName}:3:${user.accountID}:2:${user.accountID}:1:${message.messageID}:4:${message.subject}:8:${message.isNew}:9:${isSender}:5:${message.body}:7:uploadDate`;
		} else {
			fc.error(`Удаление сообщения ${messageID} не выполнено: ошибка авторизации`);
			return '-1';
		}
	});
}

export { router };