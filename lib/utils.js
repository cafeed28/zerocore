const fs = require('fs').promises;
const crypto = require('crypto');

module.exports = class Utils {
    static robtopToJson(response) {
        if (!response || response == '-1') return {};

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
                array.push(keys[x] + ':' + values[x]);
            }

            array = array.join(':');
            result.push(array);
        }
        return result.join('|');
    }

    static checkKeys(body, keys) {
        return !keys.map(key => body.hasOwnProperty(key)).includes(false);
    }

    static async getUserString(accountID) {
        return new Promise(async(resolve, reject) => {
            const account = await global.server.accounts.findOne({ accountID: accountID });
            resolve(`${accountID}:${account.userName}:${accountID}`);
        });
    }

    static async getSongString(songID) {
        return new Promise(async(resolve, reject) => {
            const song = await global.server.songs.findOne({ songID: songID });
            if (!song || song.length == 0) {
                resolve(false);
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

    static genSolo(levelString) {
        let hash = '';
        let x = 0;
        for (let i = 0; i < levelString.length; i += parseInt(levelString.length / 40)) {
            if (x > 39) break;
            hash += levelString[i];
            x++;
        }
        return crypto.createHash('sha1').update(hash + 'xI25fpAapCQg').digest('hex');
    }

    static genSolo2(levelsMultiString) {
        return crypto.createHash('sha1').update(levelsMultiString + 'xI25fpAapCQg').digest('hex');
    }

    static genSolo3(levelsMultiString) {
        return crypto.createHash('sha1').update(levelsMultiString + 'oC36fpYaPtdg').digest('hex');
    }

    static genSolo4(levelsMultiString) {
        return crypto.createHash('sha1').update(levelsMultiString + 'pC26fpYaQCtg').digest('hex');
    }

    static async genMulti(levelsMultiString) {
        // return '4b54f515b2780c774968324d548aedc2fb8aa49c';
        return new Promise(async(resolve, reject) => {
            let levelsArray = levelsMultiString.split(',');
            let hash = '';

            await Promise.all(levelsArray.map(async(levelID) => {
                if (isNaN(levelID)) {
                    resolve(false);
                }

                const level = await global.server.levels.findOne({ levelID: levelID });

                // hash += level.levelID + (level.levelID - 1) + level.starStars + level.starCoins;
                hash += String(level.levelID)[0] + String(level.levelID).slice(String(level.levelID).length - 1) + (String(level.starStars) || '0') + (String(level.starCoins) || '0');
            }));

            resolve(crypto.createHash('sha1').update(hash + 'xI25fpAapCQg').digest('hex'));
        });
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
}