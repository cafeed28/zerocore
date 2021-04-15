import fc from 'fancy-console';
import moment from 'moment';
import config from '../config';

import WebHelper from '../helpers/classes/WebHelper';
import GJCrypto from '../helpers/classes/GJCrypto';

import { IMessage, MessageModel } from '../helpers/models/message';
import { UserModel } from '../helpers/models/user';
import { BlockModel } from '../helpers/models/block';
import { FriendModel } from '../helpers/models/friend';

async function router(router: any, options: any) {
	router.post(`/${config.basePath}/deleteGJMessages20.php`, async (req: any, res: any) => {
		const requredKeys = ['messageID', 'accountID', 'gjp'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

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

			await MessageModel.find({
				messageID: {
					$in: messages
				},
				senderID: accountID
			}).limit(limit).deleteMany();

			await MessageModel.find({
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

	router.post(`/${config.basePath}/downloadGJMessage20.php`, async (req: any, res: any) => {
		const requredKeys = ['messageID', 'accountID', 'gjp'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const gjp = body.gjp;
		let accountID = body.accountID;
		let messageID = body.messageID;
		let isSender = body.isSender || 0;

		if (GJCrypto.gjpCheck(gjp, accountID)) {
			let message = await MessageModel.findOne({
				messageID: messageID
			});

			if (!message) {
				fc.error(`Скачивание сообщения ${messageID} не выполнено: сообщение не найдено`);
				return '-1';
			}

			if (isSender == 0) {
				await MessageModel.updateOne({
					messageID: messageID
				}, {
					isUnread: false
				});

				accountID = message.recipientID;
			} else if (isSender == 1) {
				accountID = message.senderID;
			}

			let user = await UserModel.findOne({ accountID: accountID });

			let uploadDate = moment(message.uploadDate).fromNow(true);
			fc.success(`Скачивание сообщения ${messageID} выполнено`);
			return `6:${user.userName}:3:${user.accountID}:2:${user.accountID}:1:${message.messageID}:4:${message.subject}:8:${+message.isUnread}:9:${isSender}:5:${message.body}:7:${uploadDate}`;
		} else {
			fc.error(`Скачивание сообщения ${messageID} не выполнено: ошибка авторизации`);
			return '-1';
		}
	});

	router.post(`/${config.basePath}/getGJMessages20.php`, async (req: any, res: any) => {
		const requredKeys = ['accountID', 'gjp', 'page'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const gjp = body.gjp;
		let accountID = body.accountID;
		const page = body.page;

		let getSent = body.getSent;
		let offset = page * 10;

		let messagesString = '';

		if (GJCrypto.gjpCheck(gjp, accountID)) {
			if (getSent != 1) {
				var messages = await MessageModel
					.find({ recipientID: accountID })
					.sort({ messageID: -1 })
					.skip(offset)
					.limit(10);

				var count = await MessageModel.countDocuments({ recipientID: accountID });
				getSent = 0;
			} else {
				var messages = await MessageModel
					.find({ senderID: accountID })
					.sort({ messageID: -1 })
					.skip(offset)
					.limit(10);

				var count = await MessageModel.countDocuments({ senderID: accountID });
				getSent = 1;
			}

			if (count == 0) {
				fc.error(`Получение сообщений для аккаунта ${accountID} не выполнено: сообщений нет`);
				return '-2';
			}

			for (const message of messages) {
				if (!message.messageID) continue;

				if (getSent == 1) accountID = message.recipientID;
				else accountID = message.senderID;

				let user = await UserModel.findOne({ accountID: accountID });

				let uploadDate = moment(message.uploadDate).fromNow(true);
				messagesString += `6:${user.userName}:3:${user.accountID}:2:${user.accountID}:1:${message.messageID}:4:${message.subject}:8:${+message.isUnread}:9:${getSent}:7:${uploadDate}|`;
			}

			fc.success(`Получение сообщений для аккаунта ${accountID} выполнено`);
			return `${messagesString}#${count}:${offset}:10`;
		} else {
			fc.error(`Получение сообщений для аккаунта ${accountID} не выполнено: ошибка авторизации`);
			return '-1';
		}
	});

	router.post(`/${config.basePath}/uploadGJMessage20.php`, async (req: any, res: any) => {
		const requredKeys = ['secret', 'accountID', 'gjp', 'subject', 'toAccountID', 'body'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const gjp = body.gjp;
		let accountID: number = body.accountID;
		let recipientID: number = body.toAccountID;
		let subject: string = body.subject;
		let msgbody: string = body.body;

		if (accountID == recipientID) {
			fc.error(`Отправление сообщения аккаунту ${recipientID} не выполнено: всмысле ты как себе пытаешься написать?`);
			return '-1';
		}

		if (GJCrypto.gjpCheck(gjp, accountID)) {
			let isBlocked = await BlockModel.findOne({ accountID1: recipientID, accountID2: accountID });

			let sender = await UserModel.findOne({ accountID: accountID });
			let recipient = await UserModel.findOne({ accountID: recipientID });
			let mSOnly = recipient.mS;

			let isFriend = await FriendModel.findOne({
				$or: [
					{ accountID1: accountID, accountID2: recipientID },
					{ accountID2: accountID, accountID1: recipientID }
				]
			});

			if (mSOnly == 2) {
				fc.error(`Отправление сообщения аккаунту ${recipientID} не выполнено: получатель запретил принимать сообщения`);
				return '-1';
			}

			if (!isBlocked && ((!mSOnly || mSOnly != 2) || !isFriend)) {
				let message: IMessage = {
					subject: subject,
					body: msgbody,
					senderID: accountID,
					recipientID: recipientID,
					userName: sender.userName,
					messageID: (await MessageModel.countDocuments()) + 1,
					uploadDate: Date.now(),
				};

				await MessageModel.create(message);
			}

			fc.success(`Отправление сообщения аккаунту ${recipientID} выполнено`);
			return '1';
		} else {
			fc.error(`Отправление сообщения аккаунту ${recipientID} не выполнено: ошибка авторизации`);
			return '-1';
		}
	});
}

export { router };