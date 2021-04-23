import fc from 'fancy-console';
import config from '../../config';

import axios from 'axios';

import WebHelper from '../../helpers/classes/WebHelper';
import APIHelpers from '../../helpers/classes/API';
import GJHelpers from '../../helpers/classes/GJHelpers';

import { IRole, RoleModel } from '../../helpers/models/role';
import { IRoleAssign, RoleAssignModel } from '../../helpers/models/roleAssign';
import EPermissions from '../../helpers/EPermissions';
import { AccountModel } from '../../helpers/models/account';

async function router(router: any, options: any) {
	router.get(`/${config.basePath}/api/roles`, async (req: any, res: any) => {
		let rolesList: any[] = [];

		const roles = await RoleModel.find();
		roles.map(role => {
			rolesList.push(role);
		});

		return {
			'status': 'success',
			'value': rolesList
		};
	});

	router.post(`/${config.basePath}/api/roles`, async (req: any, res: any) => {
		const requredKeys = ['roleName', 'userName', 'password'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const roleName = APIHelpers.translitCyrillic(body.roleName).trim();

		const userName = body.userName.trim();
		const password = body.password.trim();
		if (!await GJHelpers.isValid(userName, password)) {
			fc.error(`Роль ${roleName} не создана: ошибка аутентификации (${userName})`);
			return {
				'status': 'error',
				'code': 'authError'
			}
		}

		const account = await AccountModel.findOne({
			userName: userName
		});
		if (await GJHelpers.getAccountPermission(account.accountID, EPermissions.badgeLevel) != 2) {
			fc.error(`Роль ${roleName} не создана: нет прав (${userName})`);
			return {
				'status': 'error',
				'code': 'permError'
			}
		}

		if (roleName == '') {
			fc.error(`Роль не создана: пустое название`);
			return {
				'status': 'error',
				'code': 'emptyName'
			};
		}

		const checkRole = await RoleModel.findOne({
			roleName: new RegExp(roleName, 'i')
		});

		if (checkRole) {
			fc.error(`Роль не создана: роль с таким названием уже есть, ID: ${checkRole.roleID}`);
			return {
				'status': 'error',
				'code': 'alreadyUploaded',
				'value': checkRole.roleID
			};
		} else {
			const role: IRole = {
				roleID: (await RoleModel.countDocuments()) + 1,
				roleName: roleName,

				freeCopy: !!parseInt(body.freeCopy),
				rateLevelDiff: !!parseInt(body.rateLevelDiff),
				rateLevelStar: !!parseInt(body.rateLevelStar),
				sendLevelRate: !!parseInt(body.sendLevelRate),

				moveLevelAcc: !!parseInt(body.moveLevelAcc),
				changeLevelDesc: !!parseInt(body.changeLevelDesc),

				badgeLevel: APIHelpers.clamp(parseInt(body.badgeLevel), 0, 2),
				requestMod: !!parseInt(body.requestMod),

				commentColor: body.commentColor || '255,255,255',
				prefix: body.prefix || ''
			};

			await RoleModel.create(role);

			axios.post(config.webhook, {
				"content": null,
				"embeds": [
					{
						"title": `Role Created by ${userName}`,
						"color": 3715756,
						"fields": [
							{
								"name": `${roleName}`,
								"value": `${role.roleID}`
							}
						],
						"footer": {
							"text": "ZeroCore Webhook"
						},
						"timestamp": new Date().toISOString()
					}
				]
			});

			fc.success(`Роль ${roleName} создана`);
			return {
				'status': 'success',
				'value': role.roleID
			};
		}
	});

	router.post(`/${config.basePath}/api/assignrole`, async (req: any, res: any) => {
		const requredKeys = ['roleID', 'accountID', 'userName', 'password'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const roleID = body.roleID;
		const accountID = body.accountID;

		if (roleID == '' || accountID == '') {
			fc.error(`Роль не назначена: пустой ID`);
			return {
				'status': 'error',
				'code': 'emptyID'
			};
		}

		const userName = body.userName.trim();
		const password = body.password.trim();
		if (!await GJHelpers.isValid(userName, password)) {
			fc.error(`Роль ${roleID} не назначена аккаунту ${accountID}: ошибка аутентификации (${userName})`);
			return {
				'status': 'error',
				'code': 'authError'
			}
		}

		const account = await AccountModel.findOne({
			userName: userName
		});
		if (await GJHelpers.getAccountPermission(account.accountID, EPermissions.badgeLevel) != 2) {
			fc.error(`Роль ${roleID} не назначена аккаунту ${accountID}: нет прав (${userName})`);
			return {
				'status': 'error',
				'code': 'permError'
			}
		}

		const checkAssign = await RoleAssignModel.findOne({
			roleID: roleID
		});

		if (checkAssign) {
			fc.error(`Роль ${roleID} не назначена аккаунту ${accountID}: уже назначена`);
			return {
				'status': 'error',
				'code': 'alreadyAssigned',
				'value': checkAssign.assignID
			};
		} else {
			const assign: IRoleAssign = {
				assignID: (await RoleAssignModel.countDocuments()) + 1,
				accountID: accountID,
				roleID: roleID
			};

			await RoleAssignModel.create(assign);

			axios.post(config.webhook, {
				"content": null,
				"embeds": [
					{
						"title": `Role ${roleID} Assigned to ${accountID} by ${userName}`,
						"color": 3715756,
						"fields": [
							{
								"name": `${roleID}`,
								"value": `${assign.assignID}`
							}
						],
						"footer": {
							"text": "ZeroCore Webhook"
						},
						"timestamp": new Date().toISOString()
					}
				]
			});

			fc.success(`Роль ${roleID} назначена аккаунту ${accountID}`);
			return {
				'status': 'success',
				'value': assign.assignID
			};
		}
	});

	router.get(`/${config.basePath}/api/roles/:id`, async (req: any, res: any) => {
		const body = req.body;
		let songList: any[] = [];
	});
}

export { router };