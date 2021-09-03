import config from '../../../config'

import { Request, Response } from 'polka'

import API from '../../../helpers/API'

let path = `/${config.basePath}/api/auth/login`
let required = ['userName', 'token']
let callback = async (req: Request, res: Response) => {
    const body = req.body

    const userName = body.userName
    const token = body.token

    let accountID = await API.checkToken(token)

    if (accountID == 0)
        return {
            'status': 'error',
            'code': 'authError'
        }

    return {
        'status': 'success',
        'value': '1'
    }
}

export { path, required, callback }