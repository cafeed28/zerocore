import fc from 'fancy-console';

import bcrypt from 'bcrypt';

import Mongoose from '../helpers/classes/Mongoose';
import WebHelper from '../helpers/classes/WebHelper';

import GJCrypto from '../helpers/classes/GJCrypto';
import GJHelpers from '../helpers/classes/GJHelpers';
import config from '../config';

async function router(router: any, options: any) {
	router.post(`/${config.basePath}/templates/route.php`, async (req: any, res: any) => {
		const requredKeys = ['secret', 'shit'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		return 'test';
	});
}

export { router };