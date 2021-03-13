import fc from 'fancy-console';
import config from '../config';
import bcrypt from 'bcrypt';

import express from 'express';
import axios from 'axios';

import moment from 'moment';

import Mongoose from '../helpers/classes/Mongoose';
import Express from '../helpers/classes/Express';

import GJCrypto from '../helpers/classes/GJCrypto';
import GJHelpers from '../helpers/classes/GJHelpers';

const router = express.Router();

router.post(`/${config.basePath}/uploadGJAccComment(20)?(.php)?`, async (req, res) => {
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

		axios.post(config.webhook, {
			"content": null,
			"embeds": [
				{
					"title": "Created Post",
					"color": 5814783,
					"fields": [
						{
							"name": `${userName}`,
							"value": `${Buffer.from(comment, 'base64').toString('utf8')}`
						}
					],
					"footer": {
						"text": "ZeroCore Webhook"
					},
					"timestamp": new Date().toISOString()
				}
			]
		});

		fc.success(`Пост на аккаунте ${body.userName} создан`);
		return res.send('1');
	} else {
		fc.error(`Пост на аккаунте ${body.userName} не создан: ошибка авторизации`);
		return res.send('-1');
	}
});

router.post(`/${config.basePath}/deleteGJAccComment(20)?(.php)?`, async (req, res) => {
	const requredKeys = ['secret', 'gjp', 'commentID', 'accountID'];
	const body = req.body;
	if (!Express.checkKeys(body, requredKeys)) {
		fc.error(`Запрос должен иметь эти ключи: ${requredKeys.join(', ')}`);
		return res.status(400).send('-1');
	}

	const gjp = body.gjp;
	const accountID = body.accountID;
	const postID = body.commentID;

	if (GJCrypto.gjpCheck(gjp, accountID)) {
		const post = await Mongoose.posts.deleteOne({
			postID: postID,
		});

		if (post.deletedCount == 0) {
			fc.error(`Пост с аккаунта ${body.accountID} не удален: пост не найден`);
			return res.send('-1');
		} else {
			axios.post(config.webhook, {
				"content": null,
				"embeds": [
					{
						"title": "Deleted Post",
						"color": 5814783,
						"fields": [
							{
								"name": `Account ID: ${accountID}`,
								"value": `Post ID: ${postID}`
							}
						],
						"footer": {
							"text": "ZeroCore Webhook"
						},
						"timestamp": new Date().toISOString()
					}
				]
			});

			fc.success(`Пост с аккаунта ${body.accountID} удален`);
			return res.send('1');
		}

	} else {
		fc.error(`Пост с аккаунта ${body.accountID} не удален: ошибка авторизации`);
		return res.send('-1');
	}
});

router.post(`/${config.basePath}/getGJAccountComments(20)?(.php)?`, async (req, res) => {
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