import fc from 'fancy-console'

export default class WebHelper {
	static checkKeys(array: Array<any>, keys: Array<any>) {
		const object = Object.assign({}, array);
		return !keys.map(key => object.hasOwnProperty(key)).includes(false);
	}

	static checkRequired(body: any, requredKeys: any, res: any): boolean {
		if (!this.checkKeys(body, requredKeys)) {
			fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
			res.status(400).send('-1');
			return false;
		}
		return true;
	}
}