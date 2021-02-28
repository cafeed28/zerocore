import fc from 'fancy-console';

import bcrypt from 'bcrypt';
import express from 'express';

import Mongoose from '../helpers/classes/Mongoose';
import Express from '../helpers/classes/Express';

import GJCrypto from '../helpers/classes/GJCrypto';

const router = express.Router();

router.post('/accounts/loginGJAccount(.php)?', async (req, res) => {
	const requredKeys = ['secret', 'userName', 'password'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	const account = await Mongoose.accounts.findOne({ userName: body.userName });

	if (!account) {
		fc.error(`Вход в аккаунт ${body.userName} не выполнен: аккаунта не существует`);
		return res.send('-1');
	} else {
		if (await bcrypt.compare(body.password, account.password)) {
			fc.success(`Вход в аккаунт ${body.userName} выполнен`);
			return res.send(`${account.accountID},${account.accountID}`);
		} else {
			fc.error(`Вход в аккаунт ${body.userName} не выполнен: неверный пароль`);
			return res.send('-12');
		}
	}
});

router.post('/accounts/registerGJAccount(.php)?', async (req, res) => {
	const requredKeys = ['secret', 'userName', 'password', 'email'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	const checkUser = await Mongoose.accounts.findOne({ userName: body.userName });

	if (checkUser) {
		fc.error(`Аккаунт ${body.userName} не создан: такой аккаунт уже существует`);
		return res.send('-2');
	} else {
		const account = new Mongoose.accounts({
			accountID: (await Mongoose.accounts.countDocuments()) + 1,
			userName: body.userName,
			password: await bcrypt.hash(body.password, 10),
			email: body.email,
			secret: body.secret
		});

		account.save();

		fc.success(`Аккаунт ${body.userName} создан`);
		return res.send('1');
	}
});

router.post('/accounts/updateGJAccSettings20(.php)?', async (req, res) => {
	const requredKeys = ['secret', 'gjp', 'accountID', 'mS', 'frS', 'cS', 'yt', 'twitter', 'twitch'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	const gjp = body.gjp;
	const accountID = body.accountID;
	const mS = body.mS;
	const frS = body.frS;
	const cS = body.cS;
	const yt = body.yt;
	const twitter = body.twitter;
	const twitch = body.twitch;

	if (GJCrypto.gjpCheck(gjp, accountID)) {
		await Mongoose.users.findOneAndUpdate({
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
		return res.send('1');
	} else {
		fc.error(`Настройки пользователя ${accountID} не обновлены: ошибка авторизации`);
		return res.send('-1');
	}
});

export { router };