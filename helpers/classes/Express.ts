export default class Express {
	static checkKeys(array: Array<any>, keys: Array<any>) {
		const object = Object.assign({}, array);
		return !keys.map(key => object.hasOwnProperty(key)).includes(false);
	}
}