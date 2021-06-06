import tinyhttp from '@opengalaxium/tinyhttp'

import fc from 'fancy-console';
import config from '../config'

import bcrypt from 'bcrypt';

import WebHelper from '../helpers/classes/WebHelper';
import GJCrypto from '../helpers/classes/GJCrypto';
import GJHelpers from '../helpers/classes/GJHelpers';

function routes(app: tinyhttp) {
	app.all(`/${config.basePath}/templates/route`, async (req: any, res: any) => {
		const requredKeys = ['secret', 'shit'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		return res.send('test')
	});
}

export { routes }