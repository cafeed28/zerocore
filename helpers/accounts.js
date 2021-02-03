const bcrypt = require('bcrypt');
const { stat } = require('fs');

const status = { alreadyExists: '-1', dosentExists: '-1', incorrectPassword: '-12' };

module.exports = {
	status: status,

	async createAccount(userName, password, email, collection) {
		return new Promise(async (resolve, reject) => {
			const checkAccount = await collection.findOne({ userName: body.userName });

			if (checkAccount) {
				return reject(status.alreadyExists);
			} else {
				const account = new collection({
					accountID: (await collection.countDocuments()) + 1,
					userName: userName,
					password: await bcrypt.hash(password, 10),
					email: email
				});
				account.save();

				return resolve('1');
			}
		});
	},

	async loginAccount(userName, password, collection) {
		const account = await collection.findOne({ userName: body.userName });

		if (!account) {
			return reject(status.dosentExists);
		} else {
			if (await bcrypt.compare(body.password, account.password)) {
				return resolve(`${account.accountID},${account.accountID}`);
			} else {
				return reject(status.incorrectPassword);
			}
		}
	}
}