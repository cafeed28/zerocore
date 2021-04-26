import fc from 'fancy-console';
import config from '../../config';

import { IUser, UserModel } from '../../helpers/models/user';

async function router(router: any, options: any) {
    router.get(`/${config.basePath}/api/users`, async (req: any, res: any) => {
        const users = await UserModel.find();

        return users.map(user => {
            let u = user;
            u.__v = u.IP = u.chest1Time = u.chest2Time = u.chest1Count = u.chest2Count = undefined;
            u._id = null;
            return u;
        });
    });
}

export { router };