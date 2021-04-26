import fc from 'fancy-console';
import config from '../config';

import moment from 'moment';

import WebHelper from '../helpers/classes/WebHelper';
import GJCrypto from '../helpers/classes/GJCrypto';
import GJHelpers from '../helpers/classes/GJHelpers';

import { FriendRequestModel, IFriendRequest } from '../helpers/models/friendRequest';
import { IUser, UserModel } from '../helpers/models/user';
import { BlockModel, IBlock } from '../helpers/models/block';
import { FriendModel, IFriend } from '../helpers/models/friend';

async function router(router: any, options: any) {
	router.all(`/${config.basePath}/getGJFriendRequests20.php`, async (req: any, res: any) => {
		const requredKeys = ['accountID', 'page'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const accountID = body.accountID;
		const page = body.page;
		const getSent = body.getSent || 0;

		let requestsList = [];

		let requests;
		if (getSent == 1) {
			requests = await FriendRequestModel.find({ fromAccountID: accountID }).skip(page * 10).limit(10);
		} else {
			requests = await FriendRequestModel.find({ toAccountID: accountID }).skip(page * 10).limit(10);
		}

		if (!requests) {
			fc.error(`Запросы в друзья аккаунту ${accountID} не получены: запросы не найдены`);
			return '-1';
		} else {
			// робтоп я тебя ненавижу...

			for (const request of requests) {
				let dateAgo = moment(request.uploadDate * 1000).fromNow(true);

				const user = await UserModel.findOne({
					accountID: getSent == 1 ? request.toAccountID : request.fromAccountID
				});

				requestsList.push(GJHelpers.jsonToRobtop([{
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
				}]));
			}
			fc.success(`Запросы в друзья аккаунту ${accountID} получены`);

			return requestsList.join('|') + `#${requests.length}:${page * 10}:10`;
		}
	});

	router.all(`/${config.basePath}/getGJUserList20.php`, async (req: any, res: any) => {
		const requredKeys = ['gjp', 'accountID', 'type'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const gjp = body.gjp;
		const accountID = body.accountID;
		const type = body.type;

		if (await GJCrypto.gjpCheck(gjp, accountID)) {
			let list: IFriend[] | IBlock[] = [];

			if (type == 0) {
				list = await FriendModel.find({
					$or: [{
						accountID1: parseInt(accountID)
					}, {
						accountID2: parseInt(accountID)
					}]
				});

			} else if (type == 1) {
				list = await BlockModel.find({
					accountID1: accountID
				});
			}

			if (list.length == 0) {
				fc.error(`Получение списка пользователей типа ${type} не удалось: список пуст`);
				return '-2';
			}

			let usersIDs: number[] = [];
			let isUnread: boolean[] = [];
			list.map((item: IBlock | IFriend) => {
				let user = item.accountID1 != accountID ? item.accountID1 : item.accountID2;
				isUnread[user] = item.accountID1 != accountID ? item.isUnread1 : item.isUnread2;

				usersIDs.push(user);
			});

			const users = await UserModel.find().where('accountID').in(usersIDs);

			let usersList: string[] = [];
			users.map(user => {
				usersList.push(GJHelpers.jsonToRobtop([{
					'1': user.userName,
					'2': user.accountID,
					'9': user.icon,
					'10': user.color1,
					'11': user.color2,
					'14': user.iconType,
					'15': user.special,
					'16': user.accountID,
					'17': user.userCoins,
					'18': 0,
					'41': +isUnread[user.accountID],
				}]));
			});

			if (type == 0) {
				await FriendModel.updateMany({ accountID2: accountID }, { isUnread1: false });
				await FriendModel.updateMany({ accountID1: accountID }, { isUnread2: false });
			}

			fc.success(`Получение списка пользователей типа ${type} удалось`);
			return usersList.join('|');
		} else {
			fc.error(`Получение списка пользователей типа ${type} не удалось: ошибка авторизации`);
			return '-1';
		}
	});

	router.all(`/${config.basePath}/acceptGJFriendRequest20.php`, async (req: any, res: any) => {
		const requredKeys = ['gjp', 'accountID', 'targetAccountID', 'requestID', 'secret'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const gjp = body.gjp;
		const accountID = body.accountID;
		const toAccountID = body.targetAccountID;
		const requestID = body.requestID;

		if (await GJCrypto.gjpCheck(gjp, accountID)) {
			await FriendRequestModel.deleteOne({
				requestID: requestID
			});

			const friend: IFriend = {
				ID: (await FriendModel.countDocuments()) + 1,
				accountID1: accountID,
				accountID2: toAccountID
			};

			FriendModel.create(friend);

			fc.success(`Запрос в друзья ${requestID} принят`);
			return '1';
		} else {
			fc.error(`Запрос в друзья ${requestID} не принят: ошибка авторизации`);
			return '-1';
		}
	});

	router.all(`/${config.basePath}/blockGJUser20.php`, async (req: any, res: any) => {
		const requredKeys = ['gjp', 'accountID', 'targetAccountID', 'secret'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const gjp = body.gjp;
		const accountID = body.accountID;
		const toAccountID = body.targetAccountID;

		if (await GJCrypto.gjpCheck(gjp, accountID)) {
			const block: IBlock = {
				accountID1: accountID,
				accountID2: toAccountID
			};

			BlockModel.create(block);

			await FriendModel.deleteOne({
				fromAccountID: accountID,
				toAccountID: toAccountID
			});

			await FriendRequestModel.deleteOne({
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

	router.all(`/${config.basePath}/unblockGJUser20.php`, async (req: any, res: any) => {
		const requredKeys = ['gjp', 'accountID', 'targetAccountID', 'secret'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const gjp = body.gjp;
		const accountID = body.accountID;
		const toAccountID = body.targetAccountID;

		if (await GJCrypto.gjpCheck(gjp, accountID)) {
			await BlockModel.findOneAndDelete({
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


	router.all(`/${config.basePath}/uploadFriendRequest20.php`, async (req: any, res: any) => {
		const requredKeys = ['gjp', 'accountID', 'toAccountID', 'secret'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const gjp = body.gjp;
		const accountID = body.accountID;
		const toAccountID = body.toAccountID;
		const message = body.comment;

		if (await GJCrypto.gjpCheck(gjp, accountID)) {
			const user = await UserModel.findOne({ accountID: toAccountID });
			const blocked = await BlockModel.findOne({ accountID1: toAccountID, accountID2: accountID });

			if (user.frS == 1 || blocked) {
				fc.error(`Запрос в друзья аккаунта ${accountID} аккаунту ${toAccountID} не отправлен: ${accountID} заблокирован ${toAccountID}`);
				return '-1';
			}

			const request: IFriendRequest = {
				requestID: (await FriendRequestModel.countDocuments()) + 1,
				fromAccountID: accountID,
				toAccountID: toAccountID,
				message: message,
				uploadDate: Math.round(new Date().getTime() / 1000)
			};

			FriendRequestModel.create(request);

			fc.success(`Запрос в друзья аккаунта ${accountID} аккаунту ${toAccountID} отправлен`);
			return '1';
		} else {
			fc.error(`Запрос в друзья аккаунта ${accountID} аккаунту ${toAccountID} не отправлен: ошибка авторизации`);
			return '-1';
		}
	});

	router.all(`/${config.basePath}/deleteGJFriendRequests20.php`, async (req: any, res: any) => {
		const requredKeys = ['gjp', 'accountID', 'targetAccountID', 'isSender', 'secret'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const gjp = body.gjp;
		const accountID = body.accountID;
		const toAccountID = body.targetAccountID;
		const isSender = body.isSender;

		if (await GJCrypto.gjpCheck(gjp, accountID)) {
			if (isSender == 0) {
				await FriendRequestModel.deleteOne({
					fromAccountID: toAccountID,
					toAccountID: accountID
				});
			} else if (isSender == 1) {
				await FriendRequestModel.deleteOne({
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

	router.all(`/${config.basePath}/readGJFriendRequest20.php`, async (req: any, res: any) => {
		const requredKeys = ['gjp', 'accountID', 'requestID', 'secret'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const gjp = body.gjp;
		const accountID = body.accountID;
		const requestID = body.requestID;

		if (await GJCrypto.gjpCheck(gjp, accountID)) {
			await FriendRequestModel.findOneAndUpdate({
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