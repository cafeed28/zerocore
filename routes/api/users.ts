import tinyhttp from '@opengalaxium/tinyhttp'

import fc from 'fancy-console';
import config from '../../config';

import { UserModel } from '../../helpers/models/user';

function routes(app: tinyhttp) {
    app.get(`/${config.basePath}/api/users`, async (req: any, res: any) => {
        const users = await UserModel.find();

        return res.send(users.map(user => {
            user.__v = user.IP = user.chest1Time = user.chest2Time = user.chest1Count = user.chest2Count = undefined;
            user._id = null;
            return user;
        }));
    });

    app.get(`/${config.basePath}/api/users/:id`, async (req: any, res: any) => {
        const user = await UserModel.findOne({ accountID: req.params.id });
        user.__v = user.IP = user.chest1Time = user.chest2Time = user.chest1Count = user.chest2Count = undefined;
        user._id = null;

        return res.send(user);
    });
}

export { routes }