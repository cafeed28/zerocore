import { IError, NextHandler, Request, Response } from 'polka'
import log from '../logger'
import http from 'http'

export default class WebHelper {
	static checkKeys(array: Array<any>, keys: Array<any>) {
		const object = Object.assign({}, array)
		return !keys.map(key => object.hasOwnProperty(key)).includes(false)
	}

	static errorHandler(err: IError, req: Request, res: Response, next: NextHandler) {
		if (err.code == 404) {
			log.info(http.STATUS_CODES[404])
			return res.writeHead(404, http.STATUS_CODES[404]).end(http.STATUS_CODES[404])
		}

		console.log(req.url)

		log.error('## SERVER ERROR ##')
		log.error(err.stack)
		res.writeHead(500, http.STATUS_CODES[500]).end(http.STATUS_CODES[500])
	}
}