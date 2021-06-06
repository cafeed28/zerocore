import tinyhttp from '@opengalaxium/tinyhttp'

import config from '../../config'
import fs from 'fs';

function routes(app: tinyhttp) {
	app.all(`/${config.basePath}/tools/songs/upload`, async (req: any, res: any) => {
		res.render('songs/upload.html')
	});
}

export { routes }