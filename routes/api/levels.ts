import express from 'express';
const app = express.Router();

import fc from 'fancy-console';
import config from '../../config';

import { ILevel, LevelModel } from '../../helpers/models/level';

app.get(`/${config.basePath}/api/levels`, async (req: any, res: any) => {
    const levels = await LevelModel.find();

    return res.send(levels.map(level => {
        let l = level;
        l.__v = l.extraString = l.IP = undefined;
        l._id = null;
        return l;
    }));
});

export { app as router };