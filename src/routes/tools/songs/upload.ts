import config from '../../../config'
import { promises as fs } from 'fs'

import { Request, Response } from 'polka'

let path = `/${config.basePath}/tools/songs/upload`
let required = []
let callback = async (req: Request, res: Response) => {
    let file = fs.readFile('views/tools/songs/upload.html', 'utf8')
    return file
}

export { path, required, callback }