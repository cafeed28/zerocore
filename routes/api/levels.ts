import express from 'express';
const app = express.Router();

import fc from 'fancy-console';
import config from '../../config';

import { LevelModel } from '../../helpers/models/level';

app.get(`/${config.basePath}/api/levels`, async (req: any, res: any) => {
    const levels = await LevelModel.find();

    return res.send(levels.map(level => {
        level.__v = level.extraString = level.IP = undefined;
        level._id = null;
        return level;
    }));
});

app.get(`/${config.basePath}/api/levels/:id`, async (req: any, res: any) => {
    const level = await LevelModel.findOne({ levelID: req.params.id });
    level.__v = level.extraString = level.IP = undefined;
    level._id = null;

    return res.send(level);
});

export { app as router };