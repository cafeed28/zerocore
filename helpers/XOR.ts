export default class XOR {
	public static text2ascii(text: any) {
		if (!text) return;
		return text.toString().split('').map((char: any) => char.charCodeAt(0));
	}

	public static cipher(data: String, key: Number) {
		if (!data || !key) return '';

		let keyAscii: any = this.text2ascii(key);
		let dataAscii: any = this.text2ascii(data);
		let cipher = '';

		for (let i = 0; i < data.length; i++) {
			cipher += String.fromCodePoint(dataAscii[i] ^ keyAscii[i % key.toString().length]);
		}
		return cipher;
	}

	public static encrypt(password: String, key: String) {
		return Buffer.from(this.cipher(password, key)).toString('base64').replace(/\//g, '_').replace(/\+/g, '-');
	}

	public static decrypt(gjp: String, key: String) {
		return this.cipher(Buffer.from(gjp.replace(/_/g, '/').replace(/-/g, '+'), 'base64').toString(), key);
	}
}