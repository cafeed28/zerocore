import GJHelpers from './GJHelpers'
import XOR from './xor'
import crypto from 'crypto'

import { LevelModel } from '../models/level'
import { MapPackModel } from '../models/mappacks'

export default class GJCrypto {
	static async gjpCheck(gjp: String, accountID: any) {
		if (!gjp) return false
		let key = 37526
		let data = Buffer.from(gjp.replace(/_/g, '/').replace(/-/g, '+'), 'base64').toString('utf8')

		let gjpdecode = XOR.cipher(data, key)

		return await GJHelpers.isValidID(accountID, gjpdecode)
	}

	static genSolo(levelString: String) {
		let hash = ''
		let x = 0
		for (let i = 0; i < levelString.length; i += parseInt((levelString.length / 40).toString())) {
			if (x > 39) break
			hash += levelString[i]
			x++
		}
		return crypto.createHash('sha1').update(hash + 'xI25fpAapCQg').digest('hex')
	}

	static genSolo2(levelsMultiString: String) {
		return crypto.createHash('sha1').update(levelsMultiString + 'xI25fpAapCQg').digest('hex')
	}

	static genSolo3(levelsMultiString: String) {
		return crypto.createHash('sha1').update(levelsMultiString + 'oC36fpYaPtdg').digest('hex')
	}

	static genSolo4(levelsMultiString: String) {
		return crypto.createHash('sha1').update(levelsMultiString + 'pC26fpYaQCtg').digest('hex')
	}

	static async genMulti(levelsMultiString: string) {
		return new Promise(async (resolve, reject) => {
			let levelsArray = levelsMultiString.split(',')
			let hash = ''

			for await (let lID of levelsArray) {
				if (isNaN(parseInt(lID))) {
					return resolve(false)
				}
				let levelID = parseInt(lID)

				const level = await LevelModel.findOne({ levelID: levelID })

				hash += String(level.levelID)[0] +
					String(level.levelID).slice(String(level.levelID).length - 1) +
					(String(+level.starStars) || '0') +
					(String(+level.starCoins) || '0')
			}

			resolve(crypto.createHash('sha1').update(hash + 'xI25fpAapCQg').digest('hex'))
		})
	}

	static async genPack(packsMultiString: string) {
		return new Promise(async (resolve, reject) => {
			let packsArray = packsMultiString.split(',')
			let hash = ''

			for await (let pID of packsArray) {
				if (isNaN(parseInt(pID))) {
					resolve(false)
				}
				let packID = parseInt(pID)

				const level = await MapPackModel.findOne({ packID: packID })

				hash += String(level.packID)[0] +
					String(level.packID).slice(String(level.packID).length - 1) +
					(String(level.stars) || '0') +
					(String(level.coins) || '0')
			}

			resolve(crypto.createHash('sha1').update(hash + 'xI25fpAapCQg').digest('hex'))
		})
	}
}