import express from 'express';
const app = express.Router();

import fc from 'fancy-console';
import config from '../config';

import bcrypt from 'bcrypt';

import WebHelper from '../helpers/classes/WebHelper';
import GJCrypto from '../helpers/classes/GJCrypto';

import { AccountModel, IAccount } from '../helpers/models/account';
import { UserModel } from '../helpers/models/user';
import { ActionModel, IAction } from '../helpers/models/actions';
import EActions from '../helpers/EActions';

app.all(`/${config.basePath}/accounts/loginGJAccount`, async (req: any, res: any) => {
	const requredKeys = ['secret', 'userName', 'password'];
	const body = req.body;
	if (!WebHelper.checkRequired(body, requredKeys, res)) return;

	const account = await AccountModel.findOne({ userName: body.userName });

	if (!account) {
		fc.error(`Вход в аккаунт ${body.userName} не выполнен: аккаунта не существует`);
		return res.send('-1')
	} else {
		if (await bcrypt.compare(body.password, account.password)) {
			fc.success(`Вход в аккаунт ${body.userName} выполнен`);

			const action: IAction = {
				actionType: EActions.accountLogin,
				IP: req.ip,
				timestamp: Date.now(),
				accountID: account.accountID
			}
			await ActionModel.create(action);

			return `${account.accountID},${account.accountID}`;
		} else {
			fc.error(`Вход в аккаунт ${body.userName} не выполнен: неверный пароль`);
			return res.send('-12')
		}
	}
});

app.all(`/${config.basePath}/accounts/registerGJAccount`, async (req: any, res: any) => {
	const requredKeys = ['secret', 'userName', 'password', 'email'];
	const body = req.body;
	if (!WebHelper.checkRequired(body, requredKeys, res)) return;

	const checkUser = await AccountModel.findOne({ userName: body.userName });

	if (checkUser) {
		fc.error(`Аккаунт ${body.userName} не создан: такой аккаунт уже существует`);
		return res.send('-2')
	} else {
		const account: IAccount = {
			accountID: (await AccountModel.find({}).sort({ _id: -1 }).limit(1))[0].accountID + 1,
			userName: body.userName,
			password: await bcrypt.hash(body.password, 10),
			email: body.email
		};

		await AccountModel.create(account);

		fc.success(`Аккаунт ${body.userName} создан`);
		return res.send('1')
	}
});

app.all(`/${config.basePath}/updateGJAccSettings20`, async (req: any, res: any) => {
	const requredKeys = ['secret', 'gjp', 'accountID', 'mS', 'frS', 'cS', 'yt', 'twitter', 'twitch'];
	const body = req.body;
	if (!WebHelper.checkRequired(body, requredKeys, res)) return;

	const gjp = body.gjp;
	const accountID = body.accountID;
	const mS = body.mS;
	const frS = body.frS;
	const cS = body.cS;
	const yt = body.yt;
	const twitter = body.twitter;
	const twitch = body.twitch;

	if (await GJCrypto.gjpCheck(gjp, accountID)) {
		await UserModel.findOneAndUpdate({
			accountID: accountID
		}, {
			mS: mS,
			frS: frS,
			cS: cS,
			youtube: yt,
			twitter: twitter,
			twitch: twitch
		});

		fc.success(`Настройки пользователя ${accountID} обновлены`);
		return res.send('1')
	} else {
		fc.error(`Настройки пользователя ${accountID} не обновлены: ошибка авторизации`);
		return res.send('-1')
	}
});

export { app as router };