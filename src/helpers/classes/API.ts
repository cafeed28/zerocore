import axios from 'axios'
import jwt from 'jsonwebtoken'
import config from '../../config'
import { IAccount } from '../models/account'
import { AuthModel } from '../models/auth'

export default class API {
	static generateToken(account: IAccount) {
		return jwt.sign(
			{ account },
			config.tokenSecret, { expiresIn: '48h' }
		)
	}

	static async checkToken(token: string) {
		let auth = await AuthModel.findOne({ token: token })
		if (auth) return auth.accountID
		return 0
	}

	static async verifySongUrl(url: string) {
		let res
		try {
			res = await axios.get(url)
		}
		catch (e) {
			throw e
			// return false;
		}

		if (res.status == 200) {
			let type: string = res.headers['content-type']
			if (type.startsWith('audio') || type.startsWith('application/octet-stream') || type.startsWith('application/binary')) {
				return true
			}
			else return false
		}
		return false
	}

	static translitCyrillic(text: string) {
		var arrRu = ['Я', 'я', 'Ю', 'ю', 'Ч', 'ч', 'Ш', 'ш', 'Щ',
			'щ', 'Ж', 'ж', 'А', 'а', 'Б', 'б', 'В', 'в', 'Г', 'г', 'Д',
			'д', 'Е', 'е', 'Ё', 'ё', 'З', 'з', 'И', 'и', 'Й', 'й', 'К',
			'к', 'Л', 'л', 'М', 'м', 'Н', 'н', 'О', 'о', 'П', 'п', 'Р',
			'р', 'С', 'с', 'Т', 'т', 'У', 'у', 'Ф', 'ф', 'Х', 'х', 'Ц',
			'ц', 'Ы', 'ы', 'Ь', 'ь', 'Ъ', 'ъ', 'Э', 'э', ' '
		]
		var arrEn = ['Ya', 'ya', 'Yu', 'yu', 'Ch', 'ch', 'Sh', 'sh',
			'Sh', 'sh', 'Zh', 'zh', 'A', 'a', 'B', 'b', 'V', 'v', 'G',
			'g', 'D', 'd', 'E', 'e', 'E', 'e', 'Z', 'z', 'I', 'i', 'J',
			'j', 'K', 'k', 'L', 'l', 'M', 'm', 'N', 'n', 'O', 'o', 'P',
			'p', 'R', 'r', 'S', 's', 'T', 't', 'U', 'u', 'F', 'f', 'H',
			'h', 'C', 'c', 'Y', 'y', '`', '`', '\'', '\'', 'E', 'e', ' '
		]

		var reg = new RegExp(`[^${arrRu.join('')}a-zA-Z]`, 'g')

		text = text.replace(reg, '')

		for (var i = 0; i < arrRu.length; i++) {
			var reg = new RegExp(arrRu[i], 'g')
			text = text.replace(reg, arrEn[i])
		}

		return text
	}

	static clamp(val: any, min: number, max: number) {
		if (typeof val != 'number') return 0
		return val > max ? max : val < min ? min : val
	}
}