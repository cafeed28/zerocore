const xor = require('./xor');
const utils = require('./utils');

module.exports = class GJPCheck {
    static check(gjp, accountID) {
		if(!gjp || gjp == 0) return false;
        let key = 37526;
        let data = Buffer.from(gjp.replace(/_/g, '/').replace(/-/g, '+'), 'base64').toString('utf8');

        let gjpdecode = xor.cipher(data, key);

        return utils.isValidID(accountID, gjpdecode);
    }
}