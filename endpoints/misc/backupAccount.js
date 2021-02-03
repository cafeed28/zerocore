const fc = require('fancy-console');
const fs = require('fs').promises;
const zlib = require('node-gzip');
const utils = require('../../lib/utils');

module.exports = {
	path: 'getAccountURL.php/database/accounts/backupGJAccountNew.php',
	aliases: ['accounts/backupGJAccountNew.php', 'getAccountURL.php/database/accounts/backupGJAccountNew', 'accounts/backupGJAccountNew'],
	requiredKeys: ['userName', 'password', 'saveData'],
	async execute(req, res, body, server) {
		let saveData = body.saveData
		const userName = body.userName;
		const password = body.password;
		const accountID = (await server.accounts.findOne({ userName: userName })).accountID;

		if (await utils.isValid(userName, password)) {
			let saveDataArr = saveData.split(';');
			let saveDataBuff = Buffer.from(saveDataArr[0].replace(/-/g, '+').replace(/_/g, '/'), 'base64');

			saveData = Buffer.from(await zlib.ungzip(saveDataBuff), 'gzip').toString('ascii');

			let orbs = saveData.split('</s><k>14</k><s>')[1].split('</s>')[0];
			let levels = saveData.split('<k>GS_value</k>')[1].split('</s><k>4</k><s>')[1].split('</s>')[0];

			saveData = Buffer.from(await zlib.gzip(saveData)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
			saveData = saveData + ';' + saveDataArr[1];

			await fs.writeFile(`data/saves/${accountID}`, saveData);
			await server.users.updateOne({ accountID: accountID }, { orbs: orbs, completedLevels: levels });

			fc.success(`Сохрнение аккаунта ${userName} выполнено`);
			return res.send('1');
		}
		else {
			fc.success(`Сохрнение аккаунта ${userName} не выполнено: ошибка авторизации`);
			return res.send('-1');
		}
	}
}