import fc from 'fancy-console';
import config from '../../config';

import { ILevel, LevelModel } from '../../helpers/models/level';

async function router(router: any, options: any) {
    router.get(`/${config.basePath}/api/levels`, async (req: any, res: any) => {
        const body = req.body;

        const levels = await LevelModel.find();

        return levels.map(level => {
            let l = level;
            l.__v = l.extraString = l.IP = undefined;
            l._id = null;
            return l;
        });
    });
}

export { router };