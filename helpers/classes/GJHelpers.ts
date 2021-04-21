import bcrypt from 'bcrypt';
import axios from 'axios';

import { AccountModel } from '../models/account';
import { RoleAssignModel } from '../models/roleAssign';
import { RoleModel } from '../models/role';
import { LevelModel } from '../models/level';
import { SongModel } from '../models/song';

export default class GJHelpers {
	static async isValid(userName: string, password: string): Promise<boolean> {
		const account = await AccountModel.findOne({ userName: userName });
		if (!account) return false;

		if (await bcrypt.compare(password, account.password)) return true;
		else return false;
	}

	static async isValidID(ID: number, password: string): Promise<boolean> {
		const account = await AccountModel.findOne({ accountID: ID });
		if (!password) {
			return account ? true : false;
		} else {
			if (!account) return false;
			return this.isValid(account.userName, password);
		}
	}

	static jsonToRobtop(json: any): string {
		let result = [];

		for (let i = 0; i < json.length; i++) {
			let object = json[i];

			let keys = Object.keys(object);
			let values = Object.values(object);

			let array = [];
			for (let x = 0; x < values.length; x++) {
				array.push(keys[x] + ':' + values[x]);
			}

			result.push(array.join(':'));
		}
		return result.join('|');
	}

	static async getUserString(accountID: number): Promise<string> {
		return new Promise(async (resolve, reject) => {
			const account = await AccountModel.findOne({ accountID: accountID });
			resolve(`${accountID}:${account.userName}:${accountID}`);
		});
	}

	static async getAccountPermission(accountID: number, permission: string): Promise<number> {
		return new Promise(async (resolve, reject) => {
			const accRoles = await RoleAssignModel.find({ accountID: accountID });
			let accRolesList: any[] = [];

			accRoles.forEach(role => { accRolesList.push(role.roleID); });

			let maxPerm = 0;

			if (accRolesList.length != 0) {
				let roles = await RoleModel.find({ roleID: { $in: accRolesList } });
				roles.forEach((role: any) => {
					if (role[permission] > maxPerm) {
						maxPerm = role[permission];
					}
				});
			}

			resolve(maxPerm);
		});
	}

	static async checkPermission(accountID: number, permission: string): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
			let maxPerm = await this.getAccountPermission(accountID, permission);
			if (maxPerm > 0) resolve(true);
			else resolve(false);
		});
	}

	static getDiffFromStars(stars: string): any {
		let diffname = 'N/A: ' + stars;
		let diff = 0;

		let auto = 0;
		let demon = 0;
		switch (stars) {
			case '1':
				diffname = 'Auto';
				diff = 50;
				auto = 1;
				break;
			case '2':
				diffname = 'Easy';
				diff = 10;
				break;
			case '3':
				diffname = 'Normal';
				diff = 20;
				break;
			case '4':
			case '5':
				diffname = 'Hard';
				diff = 30;
				break;
			case '6':
			case '7':
				diffname = 'Harder';
				diff = 40;
				break;
			case '8':
			case '9':
				diffname = 'Insane';
				diff = 50;
				break;
			case '10':
				diffname = 'Demon';
				diff = 50;
				demon = 1;
				break;
		};

		return {
			'diff': diff,
			'auto': auto,
			'demon': demon,
			'name': diffname
		};
	}

	static async rateLevel(accountID: number, levelID: number, stars: number, diff: number, auto: number, demon: number): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
			console.log(stars);
			console.log(diff);
			await LevelModel.updateOne({ levelID: levelID }, {
				starDifficulty: diff,
				starDemon: demon,
				starAuto: auto,
				starStars: stars
			});
			resolve(true);
		});
	}

	static async featureLevel(accountID: number, levelID: number, feature: number): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
			await LevelModel.updateOne({ levelID: levelID }, {
				starFeatured: feature
			});
			resolve(true);
		});
	}

	static async verifyCoinsLevel(accountID: number, levelID: number, coins: number): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
			await LevelModel.updateOne({ levelID: levelID }, {
				starCoins: coins
			});
			resolve(true);
		});
	}

	static async getSongString(songID: number): Promise<string> {
		return new Promise(async (resolve, reject) => {
			const song = await SongModel.findOne({ songID: songID });
			if (!song) {
				let params = new URLSearchParams();
				params.append('songID', songID.toString());
				params.append('secret', 'Wmfd2893gb7');

				const ngSong = await axios.post('http://www.boomlings.com/database/getGJSongInfo.php', params);
				resolve(ngSong.data + '~|~8~|~1');
				return;
			}

			let download = song.download;
			if (download.includes(':')) {
				download = encodeURIComponent(download);
			}

			const result = `1~|~${song.songID}~|~2~|~${song.name.replace('#', '')}~|~3~|~${song.authorID}~|~4~|~${song.authorName}~|~5~|~${song.size}~|~6~|~~|~10~|~${download}~|~7~|~~|~8~|~1`;
			resolve(result);
		});
	}

	static shuffle(array: any[]): any[] {
		for (let i = array.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}

		return array;
	}
}