import fc from 'fancy-console';

import bcrypt from 'bcrypt';
import express from 'express';

import Mongoose from '../helpers/classes/Mongoose';
import Express from '../helpers/classes/Express';

import GJCrypto from '../helpers/classes/GJCrypto';
import GJHelpers from '../helpers/classes/GJHelpers';
import config from '../config';

const router = express.Router();

router.post(`/${config.basePath}/templates/route(.php)?`, async (req, res) => {
	const requredKeys = ['secret', 'shit'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	return res.send('test');
});

export { router };