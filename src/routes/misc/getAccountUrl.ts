import config from '../../config'

import { Request, Response } from 'polka'

let path = `/${config.basePath}/getAccountURL.php`
let required = []
let callback = async (req: Request, res: Response) => {
    return 'http://' + req.headers.host + req.url
}

export { path, required, callback }