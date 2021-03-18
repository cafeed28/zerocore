import fc from 'fancy-console';

import bcrypt from 'bcrypt';
import moment from 'moment';

import Mongoose from '../helpers/classes/Mongoose';
import WebHelper from '../helpers/classes/WebHelper';

import GJCrypto from '../helpers/classes/GJCrypto';
import GJHelpers from '../helpers/classes/GJHelpers';
import config from '../config';

async function router(router: any, options: any) {
	router.post(`/${config.basePath}/getGJFriendRequests20.php`, async (req: any, res: any) => {
		const requredKeys = ['accountID', 'page'];
		const body = req.body;
		if (!WebHelper.checkKeys(body, requredKeys)) {
			fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
			return res.code(400).send('-1');
		}

		const accountID = body.accountID;
		const page = body.page;
		const getSent = body.getSent || 0;

		let requestsString = '';

		let requests;
		if (getSent == 1) {
			requests = await Mongoose.friendrequests.find({ fromAccountID: accountID }).skip(page * 10).limit(10);
		} else {
			requests = await Mongoose.friendrequests.find({ toAccountID: accountID }).skip(page * 10).limit(10);
		}

		if (!requests) {
			fc.error(`Запросы в друзья аккаунту ${accountID} не получены: запросы не найдены`);
			return '-1';
		} else {
			// робтоп я тебя ненавижу...

			for (const request of requests) {
				let dateAgo = moment(request.uploadDate).fromNow(true);

				const user = await Mongoose.users.findOne({
					accountID: getSent == 1 ? request.toAccountID : request.fromAccountID
				});

				requestsString += GJHelpers.jsonToRobtop([{
					'1': user.userName,
					'2': user.accountID,
					'3': user.accIcon,
					'10': user.color1,
					'11': user.color2,
					'14': user.iconType,
					'15': user.special,
					'17': user.userCoins,
					'16': user.accountID,
					'32': request.requestID,
					'35': request.message,
					'37': dateAgo,
					'41': request.isUnread
				}]) + '|';
			}
			fc.success(`Запросы в друзья аккаунту ${accountID} получены`);

			return requestsString + `#${requests.length}:${page * 10}:10`;
		}
	});

	router.post(`/${config.basePath}/getGJUserList20.php`, async (req: any, res: any) => {
		const requredKeys = ['gjp', 'accountID', 'type'];
		const body = req.body;
		if (!WebHelper.checkKeys(body, requredKeys)) {
			fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
			return res.code(400).send('-1');
		}

		const gjp = body.gjp;
		const accountID = body.accountID;
		const type = body.type;

		if (GJCrypto.gjpCheck(gjp, accountID)) {
			let collection;
			let list: any;

			if (type == 0) {
				collection = Mongoose.friends;
				list = await collection.find().or([{
					accountID1: accountID
				}, {
					accountID2: accountID
				}]);
			} else if (type == 1) {
				collection = Mongoose.blocks;
				list = await collection.find({
					accountID1: accountID
				});
			}

			if (list.length == 0) {
				fc.error(`Получение списка пользователей типа ${type} не удалось: список пуст`);
				return '-2';
			}

			let users: any = [];
			let isUnread: any = [];
			list.map((item: any) => {
				let user = item.accountID1 != accountID ? item.accountID1 : item.accountID2;
				isUnread[user] = item.accountID1 != accountID ? item.isUnread1 || 0 : item.isUnread2 || 0;

				users.push(user);
			});

			const usersList = await Mongoose.users.find().where('accountID').in(users);

			let usersString = '';
			usersList.map(user => {
				usersString += GJHelpers.jsonToRobtop([{
					'1': user.userName,
					'2': user.accountID,
					'9': user.icon,
					'10': user.color1,
					'11': user.color2,
					'14': user.iconType,
					'15': user.special,
					'16': user.accountID,
					'17': user.userCoins,
					'18': '0',
					'41': isUnread[user.accountID],
				}]) + '|';
			});

			if (type == 0) {
				await Mongoose.friends.updateMany({ accountID2: accountID }, { isUnread1: 0 });
				await Mongoose.friends.updateMany({ accountID1: accountID }, { isUnread2: 0 });
			}

			fc.log(usersString);

			fc.success(`Получение списка пользователей типа ${type} удалось`);
			return usersString;
		} else {
			fc.error(`Получение списка пользователей типа ${type} не удалось: ошибка авторизации`);
			return '-1';
		}
	});

	router.post(`/${config.basePath}/acceptGJFriendRequest20.php`, async (req: any, res: any) => {
		const requredKeys = ['gjp', 'accountID', 'targetAccountID', 'requestID', 'secret'];
		const body = req.body;
		if (!WebHelper.checkKeys(body, requredKeys)) {
			fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
			return res.code(400).send('-1');
		}

		const gjp = body.gjp;
		const accountID = body.accountID;
		const toAccountID = body.targetAccountID;
		const requestID = body.requestID;

		if (GJCrypto.gjpCheck(gjp, accountID)) {
			await Mongoose.friendrequests.deleteOne({
				requestID: requestID
			});

			const friend = new Mongoose.friends({
				ID: (await Mongoose.friends.find().sort({ _id: -1 }).limit(1))[0].ID + 1,
				accountID1: accountID,
				accountID2: toAccountID
			});

			friend.save();

			fc.success(`Запрос в друзья ${requestID} принят`);
			return '1';
		} else {
			fc.error(`Запрос в друзья ${requestID} не принят: ошибка авторизации`);
			return '-1';
		}
	});

	router.post(`/${config.basePath}/blockGJUser20.php`, async (req: any, res: any) => {
		const requredKeys = ['gjp', 'accountID', 'targetAccountID', 'secret'];
		const body = req.body;
		if (!WebHelper.checkKeys(body, requredKeys)) {
			fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
			return res.code(400).send('-1');
		}

		const gjp = body.gjp;
		const accountID = body.accountID;
		const toAccountID = body.targetAccountID;

		if (GJCrypto.gjpCheck(gjp, accountID)) {
			const block = new Mongoose.blocks({
				accountID1: accountID,
				accountID2: toAccountID
			});

			block.save();

			await Mongoose.friends.deleteOne({
				fromAccountID: accountID,
				toAccountID: toAccountID
			});

			await Mongoose.friendrequests.deleteOne({
				fromAccountID: accountID,
				toAccountID: toAccountID
			});

			fc.success(`Пользователь ${accountID} заблокировал пользователя ${toAccountID}`);
			return '1';
		} else {
			fc.error(`Пользователь ${accountID} не заблокировал пользователя ${toAccountID}: ошибка авторизации`);
			return '-1';
		}
	});

	router.post(`/${config.basePath}/unblockGJUser20.php`, async (req: any, res: any) => {
		const requredKeys = ['gjp', 'accountID', 'targetAccountID', 'secret'];
		const body = req.body;
		if (!WebHelper.checkKeys(body, requredKeys)) {
			fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
			return res.code(400).send('-1');
		}

		const gjp = body.gjp;
		const accountID = body.accountID;
		const toAccountID = body.targetAccountID;

		if (GJCrypto.gjpCheck(gjp, accountID)) {
			await Mongoose.blocks.findOneAndDelete({
				accountID1: accountID,
				accountID2: toAccountID
			});

			fc.success(`Пользователь ${accountID} разблокировал пользователя ${toAccountID}`);
			return '1';
		} else {
			fc.error(`Пользователь ${accountID} не разблокировал пользователя ${toAccountID}: ошибка авторизации`);
			return '-1';
		}
	});


	router.post(`/${config.basePath}/uploadFriendRequest20.php`, async (req: any, res: any) => {
		const requredKeys = ['gjp', 'accountID', 'toAccountID', 'secret'];
		const body = req.body;
		if (!WebHelper.checkKeys(body, requredKeys)) {
			fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
			return res.code(400).send('-1');
		}

		const gjp = body.gjp;
		const accountID = body.accountID;
		const toAccountID = body.toAccountID;
		const message = body.comment;

		if (GJCrypto.gjpCheck(gjp, accountID)) {
			const user: any = await Mongoose.users.find({ accountID: toAccountID });
			const blocked = await Mongoose.blocks.find({ accountID1: toAccountID, accountID2: accountID });

			if (user.frS == 1 || blocked.length > 0) {
				fc.error(`Запрос в друзья аккаунта ${accountID} аккаунту ${toAccountID} не отправлен: ${accountID} заблокирован ${toAccountID}`);
				return '-1';
			}

			const request = new Mongoose.friendrequests({
				requestID: await Mongoose.friendrequests.countDocuments(),
				fromAccountID: accountID,
				toAccountID: toAccountID,
				message: message
			});

			request.save();

			fc.success(`Запрос в друзья аккаунта ${accountID} аккаунту ${toAccountID} отправлен`);
			return '1';
		} else {
			fc.error(`Запрос в друзья аккаунта ${accountID} аккаунту ${toAccountID} не отправлен: ошибка авторизации`);
			return '-1';
		}
	});

	router.post(`/${config.basePath}/deleteGJFriendRequests20.php`, async (req: any, res: any) => {
		const requredKeys = ['gjp', 'accountID', 'targetAccountID', 'isSender', 'secret'];
		const body = req.body;
		if (!WebHelper.checkKeys(body, requredKeys)) {
			fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
			return res.code(400).send('-1');
		}

		const gjp = body.gjp;
		const accountID = body.accountID;
		const toAccountID = body.targetAccountID;
		const isSender = body.isSender;

		if (GJCrypto.gjpCheck(gjp, accountID)) {
			if (isSender == 0) {
				await Mongoose.friendrequests.deleteOne({
					fromAccountID: toAccountID,
					toAccountID: accountID
				});
			} else if (isSender == 1) {
				await Mongoose.friendrequests.deleteOne({
					fromAccountID: accountID,
					toAccountID: toAccountID
				});
			} else {
				fc.error(`Запрос в друзья аккаунта ${accountID} аккаунту ${toAccountID} не удален: необработанное исключение`);
				return '-1';
			}

			fc.success(`Запрос в друзья аккаунта ${accountID} аккаунту ${toAccountID} удален`);
			return '1';
		} else {
			fc.error(`Запрос в друзья аккаунта ${accountID} аккаунту ${toAccountID} не удален: ошибка авторизации`);
			return '-1';
		}
	});

	router.post(`/${config.basePath}/readGJFriendRequest20.php`, async (req: any, res: any) => {
		const requredKeys = ['gjp', 'accountID', 'requestID', 'secret'];
		const body = req.body;
		if (!WebHelper.checkKeys(body, requredKeys)) {
			fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
			return res.code(400).send('-1');
		}

		const gjp = body.gjp;
		const accountID = body.accountID;
		const requestID = body.requestID;

		if (GJCrypto.gjpCheck(gjp, accountID)) {
			await Mongoose.friendrequests.findOneAndUpdate({
				requestID: requestID
			}, { isUnread: 0 });

			fc.success(`Запрос в друзья ${requestID} прочитан`);
			return '1';
		} else {
			fc.error(`Запрос в друзья ${requestID} не прочитан: ошибка авторизации`);
			return '-1';
		}
	});
}

export { router };