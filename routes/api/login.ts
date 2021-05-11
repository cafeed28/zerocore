import express from 'express';
const app = express.Router();

import fc from 'fancy-console';
import config from '../../config';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import WebHelper from '../../helpers/classes/WebHelper';
import GJCrypto from '../../helpers/classes/GJCrypto';
import GJHelpers from '../../helpers/classes/GJHelpers';
import { AuthModel, IAuth } from '../../helpers/models/auth';
import { AccountModel } from '../../helpers/models/account';
import API from '../../helpers/classes/API';

app.post(`/${config.basePath}/api/auth/check`, async (req: any, res: any) => {
    const requredKeys = ['token'];
    const body = req.body;
    if (!WebHelper.checkRequired(body, requredKeys, res)) return;

    const token = body.token;

    const auth = await AuthModel.findOne({ token: token });
    if (auth.token != token) {
        return res.status(401);
    }

    return res.status(200);
});

app.post(`/${config.basePath}/api/auth/login`, async (req: any, res: any) => {
    const requredKeys = ['userName', 'password'];
    const body = req.body;
    if (!WebHelper.checkRequired(body, requredKeys, res)) return;

    const userName = body.userName;
    const password = body.password;

    const account = await AccountModel.findOne({ userName });

    const isValid = await GJHelpers.isValid(userName, password);

    if (!isValid) {
        return res.status(401);
    }

    let auth: IAuth = await AuthModel.findOne({ accountID: account.accountID });
    if (!auth) {
        auth = {
            token: API.generateToken(account),
            expiresAt: Date.now() + 172800,
            accountID: account.accountID
        }

        await AuthModel.create(auth);
    }

    return res.status(200).json({
        token: auth.token
    });
});


export { app as router };