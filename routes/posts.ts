import fc from 'fancy-console';

import bcrypt from 'bcrypt';
import express from 'express';
import moment from 'moment';

import Mongoose from '../helpers/Mongoose';
import Express from '../helpers/Express';

import GJCrypto from '../helpers/GJCrypto';
import GJHelpers from '../helpers/GJHelpers';

const router = express.Router();

router.post('/uploadGJAccComment(20)?(.php)?', async (req, res) => {
	const requredKeys = ['secret', 'gjp', 'userName', 'comment', 'accountID'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	const gjp = body.gjp;
	const userName = body.userName;
	const comment = body.comment;
	const accountID = body.accountID;

	if (GJCrypto.gjpCheck(gjp, accountID)) {
		const post = new Mongoose.posts({
			userName: userName,
			post: comment,
			accountID: accountID,
			uploadDate: Date.now(),
			postID: (await Mongoose.posts.countDocuments()) + 1
		});
		post.save();

		fc.success(`Пост на аккаунте ${body.userName} создан`);
		return res.send('1');
	} else {
		fc.error(`Пост на аккаунте ${body.userName} не создан: ошибка авторизации`);
		return res.send('-1');
	}
});

router.post('/deleteGJAccComment(20)?(.php)?', async (req, res) => {
	const requredKeys = ['secret', 'gjp', 'commentID', 'accountID'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	const gjp = body.gjp;
	const accountID = body.accountID;

	if (GJCrypto.gjpCheck(gjp, accountID)) {
		const post = await Mongoose.posts.deleteOne({
			postID: body.commentID,
		});
		console.log(post);
		if (post.deletedCount == 0) {
			fc.error(`Пост с аккаунта ${body.accountID} не удален: пост не найден`);
			return res.send('-1');
		} else {
			fc.success(`Пост с аккаунта ${body.accountID} удален`);
			return res.send('1');
		}

	} else {
		fc.error(`Пост с аккаунта ${body.accountID} не удален: ошибка авторизации`);
		return res.send('-1');
	}
});

router.post('/getGJAccountComments(20)?(.php)?', async (req, res) => {
	const requredKeys = ['accountID', 'page'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	const accountID = body.accountID;
	const page = body.page;

	let postsString = '';

	const posts = await Mongoose.posts.find({ accountID: accountID }).skip(page * 10).limit(10);

	if (!posts) {
		fc.error(`Посты аккаунта ${accountID} не получены: посты не найдены`);
		return res.send('-1');
	} else {
		Array.from(posts).reverse().map(post => {
			let dateAgo = moment(post.uploadDate).fromNow(true);

			// робтоп я тебя ненавижу...
			postsString += `2~${post.post}~3~${post.accountID}~4~${post.likes}~5~0~7~${post.isSpam}~9~${dateAgo}~6~${post.postID}|`;
		});
		fc.success(`Посты аккаунта ${accountID} получены`);

		return res.send(postsString + `#${posts.length}:${page}:10`);
	}
});

export { router };