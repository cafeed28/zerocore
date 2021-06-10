import tinyhttp from '@opengalaxium/tinyhttp'

import fc from 'fancy-console'
import config from '../../config'

import axios from 'axios'

import WebHelper from '../../helpers/classes/WebHelper'
import API from '../../helpers/classes/API'
import GJHelpers from '../../helpers/classes/GJHelpers'

import { IRole, RoleModel } from '../../helpers/models/role'
import { IRoleAssign, RoleAssignModel } from '../../helpers/models/roleAssign'
import EPermissions from '../../helpers/EPermissions'
import { AccountModel } from '../../helpers/models/account'

function routes(app: tinyhttp) {
	app.get(`/${config.basePath}/api/roles`, async (req: any, res: any) => {
		let rolesList: any[] = []

		const roles = await RoleModel.find()
		roles.map(role => {
			rolesList.push(role)
		})

		return res.send({
			'status': 'success',
			'value': rolesList
		})
	})

	app.post(`/${config.basePath}/api/roles`, async (req: any, res: any) => {
		const requredKeys = ['roleName', 'token']
		const body = req.body
		if (!WebHelper.checkRequired(body, requredKeys, res)) return

		const roleName = API.translitCyrillic(body.roleName).trim()
		const token = body.token.trim()

		const accountID = await API.checkToken(token)
		const account = await AccountModel.findOne({
			accountID
		})

		if (!account) {
			fc.error(`Роль ${roleName} не создана: ошибка аутентификации`)
			return res.send({
				'status': 'error',
				'code': 'authError'
			})
		}

		if (await GJHelpers.getAccountPermission(account.accountID, EPermissions.badgeLevel) != 2) {
			fc.error(`Роль ${roleName} не создана: нет прав (${account.userName})`)
			return res.send({
				'status': 'error',
				'code': 'permError'
			})
		}

		if (!roleName) {
			fc.error(`Роль не создана: пустое название`)
			return res.send({
				'status': 'error',
				'code': 'emptyName'
			})
		}

		const checkRole = await RoleModel.findOne({
			roleName: new RegExp(roleName, 'i')
		})

		if (checkRole) {
			fc.error(`Роль не создана: роль с таким названием уже есть, ID: ${checkRole.roleID}`)
			return res.send({
				'status': 'error',
				'code': 'alreadyUploaded',
				'value': checkRole.roleID
			})
		} else {
			const role: IRole = {
				roleID: (await RoleModel.find({}).sort({ _id: -1 }).limit(1))[0].roleID + 1,
				roleName: roleName,

				freeCopy: !!parseInt(body.freeCopy),
				rateLevelDiff: !!parseInt(body.rateLevelDiff),
				rateLevelStar: !!parseInt(body.rateLevelStar),
				sendLevelRate: !!parseInt(body.sendLevelRate),

				moveLevelAcc: !!parseInt(body.moveLevelAcc),
				changeLevelDesc: !!parseInt(body.changeLevelDesc),

				badgeLevel: API.clamp(parseInt(body.badgeLevel), 0, 2),
				requestMod: !!parseInt(body.requestMod),

				commentColor: body.commentColor || '255,255,255',
				prefix: body.prefix || ''
			}

			await RoleModel.create(role)

			if (!await API.sendDiscordLog(`Role Created by ${account.userName}`, roleName, role.roleID)) {
				fc.error(`Ошибка sendDiscordLog`)
			}

			fc.success(`Роль ${roleName} создана`)
			return res.send({
				'status': 'success',
				'value': role.roleID
			})
		}
	})

	app.post(`/${config.basePath}/api/assignrole`, async (req: any, res: any) => {
		const requredKeys = ['roleID', 'accountID', 'userName', 'password']
		const body = req.body
		if (!WebHelper.checkRequired(body, requredKeys, res)) return

		const roleID = body.roleID
		const accountID = body.accountID

		if (roleID == '' || accountID == '') {
			fc.error(`Роль не назначена: пустой ID`)
			return res.send({
				'status': 'error',
				'code': 'emptyID'
			})
		}

		const userName = body.userName.trim()
		const password = body.password.trim()
		if (!await GJHelpers.isValid(userName, password)) {
			fc.error(`Роль ${roleID} не назначена аккаунту ${accountID}: ошибка аутентификации (${userName})`)
			return res.send({
				'status': 'error',
				'code': 'authError'
			})
		}

		const account = await AccountModel.findOne({
			userName: userName
		})
		if (await GJHelpers.getAccountPermission(account.accountID, EPermissions.badgeLevel) != 2) {
			fc.error(`Роль ${roleID} не назначена аккаунту ${accountID}: нет прав (${userName})`)
			return res.send({
				'status': 'error',
				'code': 'permError'
			})
		}

		const checkAssign = await RoleAssignModel.findOne({
			roleID: roleID,
			accountID: accountID
		})

		if (checkAssign) {
			fc.error(`Роль ${roleID} не назначена аккаунту ${accountID}: уже назначена`)
			return res.send({
				'status': 'error',
				'code': 'alreadyAssigned',
				'value': checkAssign.assignID
			})
		} else {
			const assign: IRoleAssign = {
				assignID: (await RoleAssignModel.find({}).sort({ _id: -1 }).limit(1))[0].assignID + 1,
				accountID: accountID,
				roleID: roleID
			}

			await RoleAssignModel.create(assign)

			if (!await API.sendDiscordLog(`Role ${roleID} Assigned to ${accountID} by ${userName}`, roleID, assign.assignID)) {
				fc.error(`Ошибка sendDiscordLog`)
			}

			fc.success(`Роль ${roleID} назначена аккаунту ${accountID}`)
			return res.send({
				'status': 'success',
				'value': assign.assignID
			})
		}
	})

	app.get(`/${config.basePath}/api/roles/:id`, async (req: any, res: any) => {
		const body = req.body
		let songList: any[] = []
	})
}

export { routes }