import tinyhttp from '@opengalaxium/tinyhttp'

import fc from 'fancy-console'
import config from '../../config'

import axios from 'axios'

import WebHelper from '../../helpers/classes/WebHelper'
import GJHelpers from '../../helpers/classes/GJHelpers'

import { DailyModel, IDaily } from '../../helpers/models/daily'
import { LevelModel } from '../../helpers/models/level'
import { AccountModel } from '../../helpers/models/account'
import EPermissions from '../../helpers/EPermissions'
import API from '../../helpers/classes/API'

function routes(app: tinyhttp) {
	app.get(`/${config.basePath}/api/daily`, async (req: any, res: any) => {
		const d = Math.round(new Date().getTime() / 1000)

		const daily = await DailyModel.find({
			timestamp: {
				$lt: d
			},
			type: 0
		}).sort({ timestamp: -1 })

		const weekly = await DailyModel.find({
			timestamp: {
				$lt: d
			},
			type: 1
		}).sort({ timestamp: -1 })

		return res.json({
			'status': 'success',
			'value': {
				'daily': daily[0],
				'weekly': weekly[0]
			}
		})
	})

	app.post(`/${config.basePath}/api/daily`, async (req: any, res: any) => {
		const requredKeys = ['levelID', 'type', 'userName', 'password']
		const body = req.body
		if (!WebHelper.checkRequired(body, requredKeys, res)) return

		const userName = body.userName.trim()
		const password = body.password.trim()
		if (!await GJHelpers.isValid(userName, password)) {
			fc.error(`Дейли не назначен: ошибка аутентификации (${userName})`)
			return res.json({
				'status': 'error',
				'code': 'authError'
			})
		}

		const account = await AccountModel.findOne({
			userName: userName
		})
		if (await GJHelpers.getAccountPermission(account.accountID, EPermissions.badgeLevel) != 2) {
			fc.error(`Делйи не назначен: нет прав (${userName})`)
			return res.json({
				'status': 'error',
				'code': 'permError'
			})
		}

		const levelID = body.levelID
		let type = body.type

		if (levelID == '') {
			fc.error(`Дейли не назначен: пустой ID`)
			return res.json({
				'status': 'error',
				'code': 'emptyName'
			})
		}

		if (type != 0 && type != 1) {
			fc.error(`Дейли не назначен: тип может быть только 0 и 1`)
			return res.json({
				status: 'error',
				code: 'dailyOrWeeklyOnly'
			})
		}

		const checkDaily = await DailyModel.findOne({
			levelID: levelID
		})

		if (checkDaily) {
			fc.error(`Дейли не назначен: этот уровень уже назначен`)
			return res.json({
				'status': 'error',
				'code': 'alreadyUploaded'
			})
		} else {
			const level = await LevelModel.findOne({ levelID: levelID })

			if (!level) {
				fc.error(`Дейли не назначен: такого уровня нет`)
				return res.json({
					'status': 'error',
					'value': 'levelNotFound'
				})
			}

			const daily: IDaily = {
				levelID: levelID,
				timestamp: Math.round(new Date().getTime() / 1000),
				type: type,
				feaID: (await DailyModel.find({}).sort({ _id: -1 }).limit(1))[0].feaID + 1
			}

			await DailyModel.create(daily)

			if (!await API.sendDiscordLog(`Daily Appointed by ${userName}`, `${level.levelName}, ID: ${levelID}`, `Type: ${type}`)) {
				fc.error(`Ошибка sendDiscordLog`)
			}

			fc.success(`Дейли ${level.levelName} с ID ${levelID} назначен (${userName})`)
			return res.json({
				'status': 'success',
				'value': levelID
			})
		}
	})
}

export { routes }