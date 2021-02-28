import Mongoose from './Mongoose';
import GJHelpers from './GJHelpers';
import XOR from './xor';
import crypto from 'crypto';

export default class GJCrypto {
	static gjpCheck(gjp: String, accountID: any) {
		if (!gjp) return false;
		let key = 37526;
		let data = Buffer.from(gjp.replace(/_/g, '/').replace(/-/g, '+'), 'base64').toString('utf8');

		let gjpdecode = XOR.cipher(data, key);

		return GJHelpers.isValidID(accountID, gjpdecode);
	}

	static genSolo(levelString: String) {
		let hash = '';
		let x = 0;
		for (let i = 0; i < levelString.length; i += parseInt((levelString.length / 40).toString())) {
			if (x > 39) break;
			hash += levelString[i];
			x++;
		}
		return crypto.createHash('sha1').update(hash + 'xI25fpAapCQg').digest('hex');
	}

	static genSolo2(levelsMultiString: String) {
		return crypto.createHash('sha1').update(levelsMultiString + 'xI25fpAapCQg').digest('hex');
	}

	static genSolo3(levelsMultiString: String) {
		return crypto.createHash('sha1').update(levelsMultiString + 'oC36fpYaPtdg').digest('hex');
	}

	static genSolo4(levelsMultiString: String) {
		return crypto.createHash('sha1').update(levelsMultiString + 'pC26fpYaQCtg').digest('hex');
	}

	static async genMulti(levelsMultiString: String) {
		return new Promise(async (resolve, reject) => {
			let levelsArray = levelsMultiString.split(',');
			let hash = '';

			await Promise.all(levelsArray.map(async (levelID: string) => {
				if (isNaN(parseInt(levelID))) {
					resolve(false);
				}

				const level = await Mongoose.levels.findOne({ levelID: levelID });

				hash += String(level.levelID)[0] + String(level.levelID).slice(String(level.levelID).length - 1) + (String(level.starStars) || '0') + (String(level.starCoins) || '0');
			}));

			resolve(crypto.createHash('sha1').update(hash + 'xI25fpAapCQg').digest('hex'));
		});
	}
}