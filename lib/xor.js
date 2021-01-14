module.exports = class XOR {
    static text2ascii(text) {
        if (!text) return;
        return text.toString().split('').map(char => char.charCodeAt());
    }

    static cipher(data, key) {
        if (!data || !key) return;

        key = this.text2ascii(key);
        data = this.text2ascii(data);
        let cipher = '';

        for (let i = 0; i < data.length; i++) {
            cipher += String.fromCodePoint(data[i] ^ key[i % key.length]);
        }
        return cipher;
    }

    static encrypt(password, key) {
        return Buffer.from(this.cipher(password, key)).toString('base64').replace(/\//g, '_').replace(/\+/g, '-');
    }

    static decrypt(gjp, key) {
        return this.cipher(Buffer.from(gjp.replace(/_/g, '/').replace(/-/g, '+'), 'base64').toString(), key);
    }
};