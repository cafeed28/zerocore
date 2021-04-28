import express from 'express';
const app = express.Router();

import config from '../../config';
import fs from 'fs';

app.all(`/${config.basePath}/tools/songs/upload`, async (req: any, res: any) => {
	fs.readFile('views/songs/upload.html', 'utf8', (e, data) => {
		return res.type('text/html').send(data);
	});
});

export { app as router };