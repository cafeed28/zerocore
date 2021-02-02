let request = require('request-promise-native');

module.exports = class apiLib {
	static async verifySongUrl(url) {
		let res;
		try {
			res = await request(url);
		}
		catch (e) {
			return false;
		}
		console.log(res);

		if (res.statusCode != 200) {
			if (res.headers['content-type'].startsWith('audio') || res.headers['content-type'].startsWith('document')) {
				return true;
			}
			else return false;
		}
		return false;
	}

	static translitCyrillic(text) {
		var arrRu = ['Я', 'я', 'Ю', 'ю', 'Ч', 'ч', 'Ш', 'ш', 'Щ',
			'щ', 'Ж', 'ж', 'А', 'а', 'Б', 'б', 'В', 'в', 'Г', 'г', 'Д',
			'д', 'Е', 'е', 'Ё', 'ё', 'З', 'з', 'И', 'и', 'Й', 'й', 'К',
			'к', 'Л', 'л', 'М', 'м', 'Н', 'н', 'О', 'о', 'П', 'п', 'Р',
			'р', 'С', 'с', 'Т', 'т', 'У', 'у', 'Ф', 'ф', 'Х', 'х', 'Ц',
			'ц', 'Ы', 'ы', 'Ь', 'ь', 'Ъ', 'ъ', 'Э', 'э', ' '
		];
		var arrEn = ['Ya', 'ya', 'Yu', 'yu', 'Ch', 'ch', 'Sh', 'sh',
			'Sh', 'sh', 'Zh', 'zh', 'A', 'a', 'B', 'b', 'V', 'v', 'G',
			'g', 'D', 'd', 'E', 'e', 'E', 'e', 'Z', 'z', 'I', 'i', 'J',
			'j', 'K', 'k', 'L', 'l', 'M', 'm', 'N', 'n', 'O', 'o', 'P',
			'p', 'R', 'r', 'S', 's', 'T', 't', 'U', 'u', 'F', 'f', 'H',
			'h', 'C', 'c', 'Y', 'y', '`', '`', '\'', '\'', 'E', 'e', '-'
		];

		var reg = new RegExp(`[^${arrRu.join('')}a-zA-Z]`, 'g');

		text = text.replace(reg, '');

		for (var i = 0; i < arrRu.length; i++) {
			var reg = new RegExp(arrRu[i], 'g');
			text = text.replace(reg, arrEn[i]);
		}

		return text;
	}
}