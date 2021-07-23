import bcrypt from 'bcrypt'
import axios from 'axios'

import { AccountModel } from '../mongodb/models/account'
import { RoleAssignModel } from '../mongodb/models/roleAssign'
import { RoleModel } from '../mongodb/models/role'
import { LevelModel } from '../mongodb/models/level'
import { SongModel } from '../mongodb/models/song'
import EPermissions from './EPermissions'
import { UserModel } from '../mongodb/models/user'
import { DailyModel } from '../mongodb/models/daily'

export default class GJHelpers {
	static async isValid(userName: string, password: string): Promise<boolean> {
		const account = await AccountModel.findOne({ userName: userName })
		if (!account) return false

		if (await bcrypt.compare(password, account.password)) return true
		else return false
	}

	static async isValidID(ID: number, password: string): Promise<boolean> {
		const account = await AccountModel.findOne({ accountID: ID })
		if (!password) {
			return account ? true : false
		} else {
			if (!account) return false
			return this.isValid(account.userName, password)
		}
	}

	static jsonToRobtop(json: object, split = ':'): string {
		return Object.keys(json).map(key => `${key}${split}${json[key]}`).join(split)
	}

	static async getUserString(accountID: number): Promise<string> {
		const account = await AccountModel.findOne({ accountID: accountID })
		return `${accountID}:${account.userName}:${accountID}`
	}

	static async getAccountPermission(accountID: number, permission: EPermissions): Promise<number> {
		const accRoles = await RoleAssignModel.find({ accountID: accountID })
		let accRolesList: number[] = []

		accRoles.forEach(role => { accRolesList.push(role.roleID) })

		let perm = EPermissions[permission]
		let maxPerm = 0

		if (accRolesList.length != 0) {
			let roles = await RoleModel.find({ roleID: { $in: accRolesList } })
			roles.forEach((role: any) => {
				if (role[perm] > maxPerm) {
					maxPerm = role[perm]
				}
			})
		}

		return maxPerm
	}

	static async checkPermission(accountID: number, permission: EPermissions): Promise<boolean> {
		let maxPerm = await this.getAccountPermission(accountID, permission)
		if (maxPerm > 0) return true
		else return false
	}

	static getDiffFromStars(stars: any): any {
		stars = parseInt(stars)
		let diffName = 'N/A: ' + stars
		let diff = 0

		let auto = false
		let demon = false
		switch (stars) {
			case 1:
				diffName = 'Auto'
				diff = 50
				auto = true
				break
			case 2:
				diffName = 'Easy'
				diff = 10
				break
			case 3:
				diffName = 'Normal'
				diff = 20
				break
			case 4:
			case 5:
				diffName = 'Hard'
				diff = 30
				break
			case 6:
			case 7:
				diffName = 'Harder'
				diff = 40
				break
			case 8:
			case 9:
				diffName = 'Insane'
				diff = 50
				break
			case 10:
				diffName = 'Demon'
				diff = 50
				demon = true
				break
		}

		return {
			'diff': diff,
			'auto': auto,
			'demon': demon,
			'name': diffName
		}
	}

	static async rateLevel(accountID: number, levelID: number, stars: number, diff: number, auto: boolean, demon: boolean): Promise<boolean> {
		await LevelModel.updateOne({ levelID: levelID }, {
			starDifficulty: diff,
			starDemon: demon,
			starAuto: auto,
			starStars: stars
		})
		await this.updateCreatorPoints(levelID)
		return true
	}

	static async featureLevel(accountID: number, levelID: number, feature: boolean): Promise<boolean> {
		await LevelModel.updateOne({ levelID: levelID }, {
			starFeatured: feature
		})
		return true
	}

	static async epicLevel(accountID: number, levelID: number, epic: boolean): Promise<boolean> {
		await LevelModel.updateOne({ levelID: levelID }, {
			starEpic: epic
		})
		return true
	}

	static async verifyCoinsLevel(accountID: number, levelID: number, coins: boolean): Promise<boolean> {
		await LevelModel.updateOne({ levelID: levelID }, {
			starCoins: coins
		})
		return true
	}

	/* Ехал нигер через Нигер
	   Видит нигер в реке нигер
	   Сунул нигер руку в Нигер
	   Нигер нигер нигер нигер */

	// [20.06.2021 08:09] кафiф нахуя этот комментарий обьясни?
	static async setDailyLevel(levelID: number, weekly: boolean): Promise<boolean> {
		await DailyModel.create({
			feaID: (await DailyModel.countDocuments()) + 1,
			levelID: levelID,
			timestamp: Math.floor(Date.now() / 1000),
			type: +weekly
		})
		return true
	}

	static async deleteLevel(levelID: number): Promise<boolean> {
		await LevelModel.deleteOne({ levelID })
		return true
	}

	static async updateCreatorPoints(levelID: number): Promise<void> {
		const level = await LevelModel.findOne({ levelID })
		let accountID = level.accountID
		const userLevels = await LevelModel.find({ accountID, unlisted: false })

		let cp = 0

		for await (let level of userLevels) {
			if (level.starStars) cp += 1
			if (level.starFeatured) cp += 2
			else if (level.starEpic) cp += 3
		}

		await UserModel.updateOne({ accountID: accountID }, { creatorPoints: cp })
	}

	static async getSongString(songID: number): Promise<string> {
		const song = await SongModel.findOne({ songID: songID })
		if (!song) {
			let params = new URLSearchParams()
			params.append('songID', songID.toString())
			params.append('secret', 'Wmfd2893gb7')

			const ngSong = await axios.post('http://www.boomlings.com/database/getGJSongInfo.php', params)
			return ngSong.data + '~|~8~|~1'
		}

		let download = song.download
		if (download.includes(':')) {
			download = encodeURIComponent(download)
		}

		const result = this.jsonToRobtop({
			1: song.songID,
			2: song.name.replace(/#/g, ''),
			3: song.authorID,
			4: song.authorName,
			5: song.size,
			6: '',
			7: '',
			8: 1,
			10: download,
		}, '~|~')

		return result
	}
}