export default class XOR {
	public static text2ascii(text: string) {
		if (!text) return;
		return text.toString().split('').map((char: any) => char.charCodeAt(0));
	}

	public static cipher(data: string, key: number) {
		let dataAscii: any = this.text2ascii(data);
		let keyAscii: any = this.text2ascii(key.toString());
		let cipher = '';

		for (let i = 0; i < data.length; i++) {
			let char = dataAscii[i] ^ keyAscii[i % key.toString().length]
			cipher += String.fromCodePoint(char);
		}

		return cipher;
	}

	public static encrypt(password: string, key: number) {
		return Buffer.from(this.cipher(password, key)).toString('base64').replace(/\//g, '_').replace(/\+/g, '-');
	}

	public static decrypt(gjp: string, key: number) {
		return this.cipher(Buffer.from(gjp.replace(/_/g, '/').replace(/-/g, '+'), 'base64').toString(), key);
	}
}