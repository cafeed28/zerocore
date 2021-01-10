const xor = require('./xor');
const utils = require('./utils');

module.exports = class GJPCheck {
    static check(gjp, accountID) {
        let gjpdecode = xor.cipher(Buffer.from(gjp.replace(/_/g, '/').replace(/-/g, '+'), 'base64').toString('utf8'), 37526);

        return utils.isValidID(accountID, gjpdecode);
    }
};