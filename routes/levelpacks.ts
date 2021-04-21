import fc from 'fancy-console';
import config from '../config';

import WebHelper from '../helpers/classes/WebHelper';
import GJCrypto from '../helpers/classes/GJCrypto';
import GJHelpers from '../helpers/classes/GJHelpers';
import { MapPackModel } from '../helpers/models/mappacks';
import { GauntletModel } from '../helpers/models/gauntlet';

async function router(router: any, options: any) {
	router.post(`/${config.basePath}/getGJMapPacks21.php`, async (req: any, res: any) => {
		const requredKeys = ['secret', 'page'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const page = body.page;
		const offset = page * 10;

		let packsList = [];
		let lvlsMulti: number[] = [];

		let packs = await MapPackModel
			.find()
			.sort({ packID: 1 })
			.skip(offset)
			.limit(10);

		let packsCount = await MapPackModel.countDocuments();

		for (let pack of packs) {
			lvlsMulti.push(pack.packID);

			let colors2 = pack.colors2 == 'none' ? pack.color : pack.colors2;

			packsList.push(`1:${pack.packID}:2:${pack.packName}:3:${pack.levels}:4:${pack.stars}:5:${pack.coins}:6:${pack.difficulty}:7:${pack.color}:8:${colors2}`);
		}

		let hash = await GJCrypto.genPack(lvlsMulti.join(','));
		let result = `${packsList.join('|')}#${packsCount}:${offset}:10#${hash}`;

		fc.success(`Получение маппаков выполнено`);
		return result;
	});

	router.post(`/${config.basePath}/getGJGauntlets21.php`, async (req: any, res: any) => {
		const body = req.body;

		const page = body.page;
		const offset = page * 10;

		let gauntletsList = [];
		let gauntletLevels = '';

		let gauntlets = await GauntletModel
			.find({ levelID5: { $ne: 0 } })
			.sort({ gauntletID: 1 });

		let gauntletsCount = await GauntletModel.countDocuments();

		for (let gauntlet of gauntlets) {
			let levels = `${gauntlet.levelID1},${gauntlet.levelID2},${gauntlet.levelID3},${gauntlet.levelID4},${gauntlet.levelID5}`;
			gauntletLevels += gauntlet.packID + levels;

			gauntletsList.push(`1:${gauntlet.packID}:3:${levels}`);
		}

		let hash = GJCrypto.genSolo2(gauntletLevels);
		let result = `${gauntletsList.join('|')}#${hash}`;
		console.log(result);

		fc.success(`Получение гаунтлетов выполнено`);
		return result;
	});
}

export { router };