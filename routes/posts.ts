import fc from 'fancy-console';
import config from '../config';

import axios from 'axios';
import moment from 'moment';

import WebHelper from '../helpers/classes/WebHelper';
import GJCrypto from '../helpers/classes/GJCrypto';

import { IPost, PostModel } from '../helpers/models/post';

async function router(router: any, options: any) {
	router.post(`/${config.basePath}/uploadGJAccComment20.php`, async (req: any, res: any) => {
		const requredKeys = ['secret', 'gjp', 'userName', 'comment', 'accountID'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const gjp = body.gjp;
		const userName = body.userName;
		const comment = body.comment;
		const accountID = body.accountID;

		if (GJCrypto.gjpCheck(gjp, accountID)) {
			const post: IPost = {
				userName: userName,
				post: comment,
				accountID: accountID,
				uploadDate: Date.now(),
				postID: (await PostModel.countDocuments()) + 1
			};
			await PostModel.create(post);

			axios.post(config.webhook, {
				"content": null,
				"embeds": [
					{
						"title": "Created Post",
						"color": 3715756,
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
			return '1';
		} else {
			fc.error(`Пост на аккаунте ${body.userName} не создан: ошибка авторизации`);
			return '-1';
		}
	});

	router.post(`/${config.basePath}/deleteGJAccComment20.php`, async (req: any, res: any) => {
		const requredKeys = ['secret', 'gjp', 'commentID', 'accountID'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const gjp = body.gjp;
		const accountID = body.accountID;
		const postID = body.commentID;

		if (GJCrypto.gjpCheck(gjp, accountID)) {
			const post = await PostModel.deleteOne({
				postID: postID,
			});

			if (post.deletedCount == 0) {
				fc.error(`Пост с аккаунта ${body.accountID} не удален: пост не найден`);
				return '-1';
			} else {
				axios.post(config.webhook, {
					"content": null,
					"embeds": [
						{
							"title": "Deleted Post",
							"color": 3715756,
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
				return '1';
			}

		} else {
			fc.error(`Пост с аккаунта ${body.accountID} не удален: ошибка авторизации`);
			return '-1';
		}
	});

	router.post(`/${config.basePath}/getGJAccountComments20.php`, async (req: any, res: any) => {
		const requredKeys = ['accountID', 'page'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const accountID = body.accountID;
		const page = body.page;

		let postsList: string[] = [];

		const posts = await PostModel.find({ accountID: accountID }).skip(page * 10).limit(10).sort({ postID: -1 });

		if (!posts) {
			fc.error(`Посты аккаунта ${accountID} не получены: посты не найдены`);
			return '-1';
		} else {
			posts.map(post => {
				let dateAgo = moment(post.uploadDate).fromNow(true);

				// робтоп я тебя ненавижу...
				postsList.push(`2~${post.post}~3~${post.accountID}~4~${post.likes}~5~0~7~${post.isSpam}~9~${dateAgo}~6~${post.postID}`);
			});
			fc.success(`Посты аккаунта ${accountID} получены`);

			return postsList.join('|') + `#${posts.length}:${page}:10`;
		}
	});
}

export { router };