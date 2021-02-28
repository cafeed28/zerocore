import fc from 'fancy-console';

import bcrypt from 'bcrypt';
import express from 'express';
import moment from 'moment';

import Mongoose from '../helpers/classes/Mongoose';
import Express from '../helpers/classes/Express';

import GJCrypto from '../helpers/classes/GJCrypto';
import GJHelpers from '../helpers/classes/GJHelpers';
import config from '../config';

const router = express.Router();

router.post(`${config.basePath}/uploadGJComment(21)?(.php)?`, async (req, res) => {
	const requredKeys = ['gjp', 'userName', 'accountID', 'levelID', 'comment', 'secret'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	const gjp = body.gjp;
	const userName = body.userName;
	const accountID = body.accountID;
	const levelID = body.levelID;
	const commentStr = body.comment;
	const percent = body.percent || 0;

	if (GJCrypto.gjpCheck(gjp, levelID)) {
		const comment = new Mongoose.comments({
			userName: userName,
			comment: commentStr,
			levelID: levelID,
			accountID: accountID,
			percent: percent,
			uploadDate: Date.now(),
			commentID: (await Mongoose.comments.find().sort({ _id: -1 }).limit(1))[0].commentID + 1
		});
		comment.save();

		fc.success(`Комментарий на уровне ${levelID} создан`);
		return res.send('1');
	} else {
		fc.error(`Комментарий на уровне ${levelID} не создан: ошибка авторизации`);
		return res.send('-1');
	}
});

router.post(`${config.basePath}/deleteGJComment(20)?(.php)?`, async (req, res) => {
	const requredKeys = ['gjp', 'commentID', 'levelID', 'accountID', 'secret'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	const gjp = body.gjp;
	const levelID = body.levelID;
	const accountID = body.accountID;
	const commentID = body.commentID;

	if (GJCrypto.gjpCheck(gjp, accountID)) {
		const comment = await Mongoose.comments.deleteOne({
			commentID: commentID
		});

		if (comment.deletedCount == 0) {
			fc.error(`Комментарий с уровня ${levelID} не удален: пост не найден`);
			return res.send('-1');
		} else {
			fc.success(`Комментарий с уровня ${levelID} удален`);
			return res.send('1');
		}

	} else {
		fc.error(`Комментарий с уровня ${levelID} не удален: ошибка авторизации`);
		return res.send('-1');
	}
});

router.post(`${config.basePath}/getGJComments(21)?(.php)?`, async (req, res) => {
	const requredKeys = ['levelID', 'page'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	const levelID = body.levelID;
	const page = body.page;
	const mode = body.mode || 0;

	let orderBy: any = { commentID: 1 };
	if (mode == 1) orderBy = { likes: 1 };

	let commentsString = '';
	let usersString = '';

	let users: any = [];

	const comments = await Mongoose.comments.find({ levelID: levelID }).sort(orderBy).skip(page * 10).limit(10);
	const commentsCount = await Mongoose.comments.countDocuments({ levelID: levelID });

	if (!comments || !commentsCount) {
		fc.error(`Комментарии уровня ${levelID} не получены: комментарии не найдены`);
		return res.send('-1');
	} else {
		for (const comment of comments) {
			const user = await Mongoose.users.findOne({ accountID: comment.accountID });
			if (!users.includes(user.accountID)) {
				usersString += `${user.accountID}:${user.userName}:${user.accountID}|`;
			}

			const roleAssign = await Mongoose.users.findOne({ accountID: comment.accountID });
			const userRole = await Mongoose.roles.findOne({ roleID: roleAssign.roleID });

			if (userRole) {
				var prefix: any = userRole.prefix + ' - ';
				var badgeLevel = userRole.badgeLevel;
				var commentColor = userRole.commentColor;
			}

			let dateAgo = moment(comment.uploadDate).fromNow(true);

			// надеюсь, в 2.2 будет json...

			commentsString += `2~${comment.comment}~3~${comment.accountID}~4~${comment.likes}~5~0~7~${comment.isSpam}~9~${prefix || ''}${dateAgo}~6~${comment.commentID}~10~${comment.percent}`;
			commentsString += `~11~${badgeLevel || 0}~12~${commentColor || 0}:1~${user.userName}~7~1~9~${user.icon}~10~${user.color1}~11~${user.color2}~14~${user.iconType}~15~${user.special}~16~${user.accountID}|`;
		};
		fc.success(`Комментарии уровня ${levelID} получены`);

		const result = `${commentsString}#${usersString}#${commentsCount}:${page}:10`
		console.log(result);

		return res.send(result);
	}
});

export { router };