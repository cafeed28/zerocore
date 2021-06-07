import tinyhttp from '@opengalaxium/tinyhttp'

import fc from 'fancy-console'
import config from '../config'
import drc from '../dailyRewardsConfig'

import WebHelper from '../helpers/classes/WebHelper'
import GJCrypto from '../helpers/classes/GJCrypto'
import GJHelpers from '../helpers/classes/GJHelpers'

import { UserModel } from '../helpers/models/user'
import XOR from '../helpers/classes/xor'
import rand from 'random-node-module'
import { QuestModel } from '../helpers/models/quest'

function routes(app: tinyhttp) {
	app.all(`/${config.basePath}/getGJRewards`, async (req: any, res: any) => {
		const requredKeys = ['secret', 'chk', 'gjp']
		const body = req.body
		if (!WebHelper.checkRequired(body, requredKeys, res)) return

		const accountID = body.accountID
		const udid = body.udid
		let chk: string = body.chk
		const gjp = body.gjp
		const rewardType = body.rewardType

		if (await GJCrypto.gjpCheck(gjp, accountID)) {
			const user = await UserModel.findOne({ accountID: accountID })
			if (!user) {
				fc.error(`Получение ежедневных наград для ${accountID} не выполнено: пользователь не зарегестрирован`)
				return res.send('-1')
			}

			chk = XOR.cipher(Buffer.from(chk.substring(5), 'base64').toString(), 59182)

			let time = Math.round(Date.now() / 1000) + 100

			let chest1Time = user.chest1Time
			let chest1Count = user.chest1Count
			let chest2Time = user.chest2Time
			let chest2Count = user.chest2Count

			let chest1Diff = time - chest1Time
			let chest2Diff = time - chest2Time

			let chest1Left = Math.max(0, drc.c1Timeout - chest1Diff)
			let chest2Left = Math.max(0, drc.c2Timeout - chest2Diff)

			if (rewardType == 1) {
				if (chest1Left != 0) {
					fc.error(`Получение ежедневных наград для ${accountID} не выполнено: нет награды 1`)
					return res.send('-1')
				}
				chest1Count++
				await user.updateOne({ chest1Count: chest1Count, chest1Time: time })
				chest1Left = drc.c1Timeout
			}
			else if (rewardType == 2) {
				if (chest2Left != 0) {
					fc.error(`Получение ежедневных наград для ${accountID} не выполнено: нет награды 2`)
					return res.send('-1')
				}
				chest2Count++
				await user.updateOne({ chest2Count: chest2Count, chest2Time: time })
				chest2Left = drc.c2Timeout
			}

			const r = rand.int
			let chest1Content = `${r(drc.c1MinOrbs, drc.c1MaxOrbs)},${r(drc.c1MinDiamonds, drc.c1MaxDiamonds)},${r(drc.c1MinShards, drc.c1MaxShards)},${r(drc.c1MinKeys, drc.c1MaxKeys)}`
			let chest2Content = `${r(drc.c2MinOrbs, drc.c2MaxOrbs)},${r(drc.c2MinDiamonds, drc.c2MaxDiamonds)},${r(drc.c2MInItemID, drc.c2MaxItemID)},${r(drc.c1MinKeys, drc.c1MaxKeys)}`

			let str = `1:${accountID}:${chk}:${udid}:${accountID}:${chest1Left}:${chest1Content}:${chest1Count}:${chest2Left}:${chest2Content}:${chest2Count}:${rewardType}`
			console.log(str)
			let xor = XOR.cipher(str, 59182)
			let result = Buffer.from(xor).toString('base64').replace('/', '_').replace('+', '-')

			let hash = GJCrypto.genSolo4(result)

			fc.success(`Получение ежедневных наград ${rewardType} для ${accountID} выполнено`)
			return res.send(`SaKuJ${result}|${hash}`)
		}
		else {
			fc.error(`Получение ежедневных наград для ${accountID} не выполнено: ошибка авторизации`)
			return res.send('-1')
		}
	})

	app.all(`/${config.basePath}/getGJChallenges`, async (req: any, res: any) => {
		const requredKeys = ['secret', 'chk', 'gjp']
		const body = req.body
		if (!WebHelper.checkRequired(body, requredKeys, res)) return

		const accountID = body.accountID
		const gjp = body.gjp
		const udid = body.udid

		let chk: string = body.chk

		if (await GJCrypto.gjpCheck(gjp, accountID)) {
			const user = await UserModel.findOne({
				accountID
			})

			if (!user) {
				fc.error(`Получение квестов для ${accountID} не выполнено: пользователь не зарегестрирован`)
				return res.send('-1')
			}

			let time = Math.round(Date.now()) / 1000

			chk = XOR.cipher(Buffer.from(chk.substring(5), 'base64').toString(), 19847)

			let from = Math.round(new Date('2000-12-17').getTime()) / 1000
			let diff = time - from

			let questID = Math.floor(diff / 86400) * 3

			let midnight = Math.round(new Date(new Date().setUTCHours(24, 0, 0)).getTime() / 1000) // next midnight
			let timeleft = midnight - time

			let quests = await QuestModel.find()
			quests = rand.shuffle(quests)

			let quest1 = `${questID},${quests[0].type},${quests[0].amount},${quests[0].reward},${quests[0].questName}`
			let quest2 = `${questID + 1},${quests[1].type},${quests[1].amount},${quests[1].reward},${quests[1].questName}`
			let quest3 = `${questID + 2},${quests[2].type},${quests[2].amount},${quests[2].reward},${quests[2].questName}`

			let str = `SaKuJ:${accountID}:${chk}:${udid}:${accountID}:${timeleft}:${quest1}:${quest2}:${quest3}`
			let xor = XOR.cipher(str, 19847)
			let result = Buffer.from(xor).toString('base64')

			let hash = GJCrypto.genSolo3(result)

			fc.success(`Получение квестов для ${accountID} выполнено`)
			return res.send(`SaKuJ${result}|${hash}`)
		}
		else {
			fc.error(`Получение квестов для ${accountID} не выполнено: ошибка авторизации`)
			return res.send('-1')
		}
	})
}

export { routes }