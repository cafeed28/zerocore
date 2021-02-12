import fc from 'fancy-console';

import bcrypt from 'bcrypt';
import express from 'express';

import Mongoose from '../helpers/Mongoose';
import Express from '../helpers/Express';

import GJCrypto from '../helpers/GJCrypto';
import GJHelpers from '../helpers/GJHelpers';

const router = express.Router();

router.post('/templates/route(.php)?', async (req, res) => {
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

export { router };