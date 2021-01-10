const fs = require('fs');
const crypto = require('crypto');

module.exports = class Utils {
    static checkKeys(body, keys) {
        return !keys.map(key => body.hasOwnProperty(key)).includes(false);
    }

    static async getUserID(extID, name = 'undefined') {
        let register = !isNaN(extID) ? 1 : 0,
            userID = null,
            query = await global.query('SELECT * FROM users WHERE extID = ?', [extID]);
        if (query.length) {
            userID = query[0].userID;
        } else {
            let id = await global.query('INSERT INTO users (isRegistered, extID, userName) VALUES (?, ?, ?)', [
                register, extID, name
            ]);
            userID = id.insertId;
        }

        console.log(userID);
        return userID;
    }

    static async isValid(userName, password) {
        const account = await global.server.accounts.findOne({ userName: userName, password: password });
        return account ? true : false;
    }

    static async isValidID(ID, password) {
        const account = await global.server.accounts.findOne({ accountID: ID });
        if (!password) {
            return account ? true : false;
        } else {
            if (!account) return false;
            return this.isValid(account.userName, password);
        }
    }
};