import Mongoose from './Mongoose';
import bcrypt from 'bcrypt';
import axios from 'axios';

export default class GJHelpers {
	static async isValid(userName: String, password: String) {
		const account = await Mongoose.accounts.findOne({ userName: userName });
		if (!account) return false;

		if (await bcrypt.compare(password, account.password)) return true;
		else return false;
	}

	static async isValidID(ID: Number, password: String) {
		const account = await Mongoose.accounts.findOne({ accountID: ID });
		if (!password) {
			return account ? true : false;
		} else {
			if (!account) return false;
			return this.isValid(account.userName, password);
		}
	}

	static jsonToRobtop(json: any) {
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

	static async getUserString(accountID: Number) {
		return new Promise(async (resolve, reject) => {
			const account = await Mongoose.accounts.findOne({ accountID: accountID });
			resolve(`${accountID}:${account.userName}:${accountID}`);
		});
	}

	static async getSongString(songID: Number) {
		return new Promise(async (resolve, reject) => {
			const song = await Mongoose.songs.findOne({ songID: songID });
			if (!song || song.length == 0) {
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
}