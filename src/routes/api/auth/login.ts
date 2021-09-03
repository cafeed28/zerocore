import config from '../../../config'
import log from '../../../logger'

import { Request, Response } from 'polka'
import jwt from 'jsonwebtoken'

import { AuthModel } from '../../../mongodb/models/auth'
import { AccountModel } from '../../../mongodb/models/account'

import GJHelpers from '../../../helpers/GJHelpers'
import API from '../../../helpers/API'

let path = `/${config.basePath}/api/auth/login`
let required = ['userName', 'password']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const userName = body.userName
    const password = body.password

    let isValid = GJHelpers.isValid(userName, password)

    if (!isValid)
        return {
            'status': 'error',
            'code': 'authError'
        }

    let account = await AccountModel.findOne({ userName })
    let accountID = account.accountID

    let token = await API.generateToken(account)

    await AuthModel.create({ accountID, token })

    return {
        'status': 'success',
        'value': token
    }
}

export { path, required, callback }