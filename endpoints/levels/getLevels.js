const fc = require('fancy-console');
const { jsonToRobtop, getUserString, getSongString, genMulti, robtopToJson } = require('../../lib/utils');

module.exports = {
	path: 'getGJLevels21.php',
	aliases: ['getGJLevels21'],
	requiredKeys: ['page', 'str'],
	async execute(req, res, body, server) {
		const page = body.page;

		let levelsString = '';
		let levelsMultiString = '';
		let usersString = '';
		let songsString = '';

		let params = {};
		let orderBy = {};

		if (!parseInt(body.str)) params.levelName = new RegExp(body.str, 'i');
		else params.levelID = body.str; // search by ID

		if (body.featured == 1) params.starFeatured = 1;
		if (body.original == 1) params.original = 0;
		if (body.epic == 1) params.epic = 1;

		if (body.uncompleted == 1 && body.completedLevels) {
			let completed = body.completedLevels.replace(/[^0-9,]/g, '').split(',');
			params.levelID = { $nin: completed };
		}
		if (body.onlyCompleted == 1 && body.completedLevels) {
			let completed = body.completedLevels.replace(/[^0-9,]/g, '').split(',');
			params.levelID = { $in: completed };
		}

		if (body.type == 0 || body.type == 15) { // 15 in gdw, idk for what
			orderBy = { likes: 1 };
			if (body.str) {
				if (!isNaN(body.str)) {
					params = { levelID: body.str };
				}
			}
		}
		else if (body.type == 1) {
			orderBy = { downloads: 1 };
		}
		else if (body.type == 2) {
			orderBy = { likes: 1 };
		}
		else if (body.type == 3) {
			orderBy = { uploadDate: { $lt: Date.now() - (7 * 24 * 60 * 60) } };
		}
		else if (body.type == 4) {
			orderBy = { levelID: -1 };
		}
		else if (body.type == 5) {
			params.accountID = body.str;
			orderBy = { levelID: -1 };
		}

		if (body.coins == 1) {
			params.starCoins = 1;
			params.coins = 0;
		}

		if (body.song) {
			if (!body.customSong) {
				params.audioTrack = parseInt(body.song) - 1;
				params.songID = 0;
			} else {
				params.songID = parseInt(body.song);
			}
		}

		if (body.twoPlayer == 1) params.twoPlayer = 1;
		if (body.star) params.starStars != 0;
		if (body.noStar) params.starStars = 0;

		// gauntlet

		if (body.len && body.len != '-') {
			params.levelLength = { $in: body.len.split(',') };
		}

		console.log(params);

		const levels = await server.levels.find(params).sort(orderBy).skip(page * 10).limit(10);
		const levelsCount = await server.levels.countDocuments(params);

		if (!levels.length) {
			fc.error(`Получение уровней не выполнено: уровни не найдены`);
			return res.send('-1');
		} else {
			for (const level of levels) {
				if (level.unlisted == 1) continue;

				levelsMultiString += level.levelID + ',';

				if (level.songID != 0) {
					const song = await getSongString(level.songID);
					if (song) songsString += song + '~:~';
				}

				const user = await getUserString(level.accountID)
				usersString += user + '|';

				const levelString = jsonToRobtop([{
					'1': level.levelID,
					'2': level.levelName,
					'3': level.levelDesc,
					'5': level.version || 0,
					'6': level.accountID,
					'8': '10',
					'9': level.starDifficulty,
					'10': level.downloads,
					'12': level.audioTrack,
					'13': '21',
					'14': level.likes,
					'15': level.levelLength,
					'17': level.starDemon,
					'18': level.starStars,
					'19': level.starFeatured,
					'25': level.starAuto,
					'30': level.original,
					'31': '0',
					'35': level.songID,
					'37': level.coins,
					'38': level.starCoins,
					'39': level.requestedStars,
					'40': level.ldm,
					'42': level.starEpic,
					'43': level.starDemonDiff,
					'45': level.objects,
					'46': '1',
					'47': '2',
				}]) + '|';

				levelsString += levelString;
			}

			levelsString = levelsString.slice(0, -1);
			levelsMultiString = levelsMultiString.slice(0, -1);
			usersString = usersString.slice(0, -1);
			songsString = songsString.slice(0, -3);

			let hash = await genMulti(levelsMultiString);
			if (!hash) {
				fc.success(`Получение уровней не выполнено: hash пустой`);
				return res.send('-1');
			}

			const result = `${levelsString}#${usersString}#${songsString}#${levelsCount}:${page * 10}:10#${hash}`;
			console.log(result);

			fc.success(`Получение уровней выполнено`);
			return res.send(result);
		}
	}
}