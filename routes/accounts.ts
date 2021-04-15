import fc from 'fancy-console';
import config from '../config';

import bcrypt from 'bcrypt';

import WebHelper from '../helpers/classes/WebHelper';
import GJCrypto from '../helpers/classes/GJCrypto';

import { AccountModel, IAccount } from '../helpers/models/account';
import { UserModel } from '../helpers/models/user';

async function router(router: any, options: any) {
	router.post(`/${config.basePath}/accounts/loginGJAccount.php`, async (req: any, res: any) => {
		const requredKeys = ['secret', 'userName', 'password'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const account = await AccountModel.findOne({ userName: body.userName });

		if (!account) {
			fc.error(`Вход в аккаунт ${body.userName} не выполнен: аккаунта не существует`);
			return '-1';
		} else {
			if (await bcrypt.compare(body.password, account.password)) {
				fc.success(`Вход в аккаунт ${body.userName} выполнен`);
				return `${account.accountID},${account.accountID}`;
			} else {
				fc.error(`Вход в аккаунт ${body.userName} не выполнен: неверный пароль`);
				return '-12';
			}
		}
	});

	router.post(`/${config.basePath}/accounts/registerGJAccount.php`, async (req: any, res: any) => {
		const requredKeys = ['secret', 'userName', 'password', 'email'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const checkUser = await AccountModel.findOne({ userName: body.userName });

		if (checkUser) {
			fc.error(`Аккаунт ${body.userName} не создан: такой аккаунт уже существует`);
			return '-2';
		} else {
			const account: IAccount = {
				accountID: (await AccountModel.countDocuments()) + 1,
				userName: body.userName,
				password: await bcrypt.hash(body.password, 10),
				email: body.email
			};

			await AccountModel.create(account);

			fc.success(`Аккаунт ${body.userName} создан`);
			return '1';
		}
	});

	router.post(`/${config.basePath}/accounts/updateGJAccSettings20.php`, async (req: any, res: any) => {
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

		if (GJCrypto.gjpCheck(gjp, accountID)) {
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
			return '1';
		} else {
			fc.error(`Настройки пользователя ${accountID} не обновлены: ошибка авторизации`);
			return '-1';
		}
	});
}

export { router };