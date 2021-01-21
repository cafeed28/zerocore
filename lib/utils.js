const fs = require('fs');

module.exports = class Utils {
    static robtopToJson(response) {
        if (!response || response == "-1") return {};

        let robObjects = response.split('|'); // разделить '1:2:3:4|4:3:2:1' на ['1:2:3:4', '4:3:2:1']

        let result = [];
        for (let i = 0; i < robObjects.length; i++) {
            let robObject = robObjects[i].split(':'); // разделить '1:2:3:4' на [1, 2, 3, 4]

            let parsedObject = {}
            for (let x = 0; x < robObject.length; x += 2) { // каждый 2 элемент
                if (robObject[x + 1].includes(',')) { // если значение - массив
                    robObject[x + 1] = robObject[x + 1].split(','); // разделить массив и присвоить его
                }
                parsedObject[robObject[x]] = robObject[x + 1]; // 1: 2
            }
            result.push(parsedObject);
        }
        return result;
    }

    static jsonToRobtop(json) {
        let result = [];

        for (let i = 0; i < json.length; i++) {
            let object = json[i];

            let keys = Object.keys(object);
            let values = Object.values(object);

            let array = [];
            for (let x = 0; x < values.length; x++) {
                array.push(keys[x] + ":" + values[x]);
            }

            array = array.join(':');
            result.push(array);
        }
        return result.join('|');
    }

    static checkKeys(body, keys) {
        return !keys.map(key => body.hasOwnProperty(key)).includes(false);
    }

    // static async getUserID(extID, name = 'undefined') {
    //     let register = !isNaN(extID) ? 1 : 0,
    //         userID = null,
    //         query = await global.query('SELECT * FROM users WHERE extID = ?', [extID]);
    //     if (query.length) {
    //         userID = query[0].userID;
    //     } else {
    //         let id = await global.query('INSERT INTO users (isRegistered, extID, userName) VALUES (?, ?, ?)', [
    //             register, extID, name
    //         ]);
    //         userID = id.insertId;
    //     }

    //     console.log(userID);
    //     return userID;
    // }

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
}