import tinyhttp from '@opengalaxium/tinyhttp'

import config from '../config'
import fc from 'fancy-console';

import moment from 'moment';

import WebHelper from '../helpers/classes/WebHelper';
import GJCrypto from '../helpers/classes/GJCrypto';

import { CommentModel, IComment } from '../helpers/models/comment';
import { IUser, UserModel } from '../helpers/models/user';
import { RoleModel } from '../helpers/models/role';
import { RoleAssignModel } from '../helpers/models/roleAssign';
import Commands from '../helpers/classes/Commands';
import GJHelpers from '../helpers/classes/GJHelpers';
import EPermissions from '../helpers/EPermissions';
import ICommand from '../helpers/interfaces/ICommand';

function routes(app: tinyhttp) {
	app.all(`/${config.basePath}/uploadGJComment21`, async (req: any, res: any) => {
		const requredKeys = ['gjp', 'userName', 'accountID', 'levelID', 'comment', 'secret'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const gjp = body.gjp;
		const userName = body.userName;
		const accountID = body.accountID;
		const levelID = body.levelID;
		const commentStr = body.comment;
		const percent = body.percent || 0;

		if (await GJCrypto.gjpCheck(gjp, accountID)) {
			const commentDec = Buffer.from(commentStr, 'base64').toString('utf8');
			if (commentDec.startsWith(config.prefix)) {
				const args = commentDec.slice(config.prefix.length).trim().split(/ +/);
				const commandName = args.shift().toLowerCase();

				if (Commands.has(commandName)) {
					const command: ICommand = Commands.get(commandName);
					let perms: number[] = [];
					for await (let perm of command.requiredPerms) {
						perms.push(await GJHelpers.getAccountPermission(accountID, perm));
					}

					if (perms.includes(0)) {
						fc.error(`Команда ${commandName} на уровне ${levelID} не выполнена: доступ запрещен`);
						return res.send('-1')
					}

					try {
						command.execute(accountID, levelID, args)
						fc.success(`Команда ${commandName} на уровне ${levelID} выполнена`);
						return res.send('-1')
					}
					catch (e) {
						fc.error(`Команда ${commandName} на уровне ${levelID} не выполнена:`, e);
						return res.send('-1')
					}
				}
			}

			const comment: IComment = {
				userName: userName,
				comment: commentStr,
				levelID: levelID,
				accountID: accountID,
				percent: percent,
				uploadDate: Math.round(Date.now() / 1000),
				commentID: (await CommentModel.find({}).sort({ _id: -1 }).limit(1))[0].commentID + 1,
				likes: 0,
				isSpam: 0
			};
			CommentModel.create(comment);

			fc.success(`Комментарий на уровне ${levelID} создан`);
			return res.send('1')
		} else {
			fc.error(`Комментарий на уровне ${levelID} не создан: ошибка авторизации`);
			return res.send('-1')
		}
	});

	app.all(`/${config.basePath}/deleteGJComment20`, async (req: any, res: any) => {
		const requredKeys = ['gjp', 'commentID', 'levelID', 'accountID', 'secret'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const gjp = body.gjp;
		const levelID = body.levelID;
		const accountID = body.accountID;
		const commentID = body.commentID;

		if (await GJCrypto.gjpCheck(gjp, accountID)) {
			const comment = await CommentModel.deleteOne({
				commentID: commentID
			});

			if (comment.deletedCount == 0) {
				fc.error(`Комментарий с уровня ${levelID} не удален: пост не найден`);
				return res.send('-1')
			} else {
				fc.success(`Комментарий с уровня ${levelID} удален`);
				return res.send('1')
			}

		} else {
			fc.error(`Комментарий с уровня ${levelID} не удален: ошибка авторизации`);
			return res.send('-1')
		}
	});

	app.all(`/${config.basePath}/getGJComments21`, async (req: any, res: any) => {
		const requredKeys = ['page'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const levelID = body.levelID;
		const page = body.page;
		const mode = body.mode || 0;

		let orderBy: any = { commentID: 1 };
		if (mode == 1) orderBy = { likes: 1 };

		let commentsList = [];
		let usersList = [];

		let users: number[] = [];

		const comments = await CommentModel.find({ levelID: levelID }).sort(orderBy).skip(page * 10).limit(10);
		const commentsCount = await CommentModel.countDocuments({ levelID: levelID });

		if (!comments || !commentsCount) {
			fc.error(`Комментарии уровня ${levelID} не получены: комментарии не найдены`);
			return res.send('-2')
		} else {
			for (const comment of comments) {
				const user = await UserModel.findOne({ accountID: comment.accountID });
				if (!users.includes(user.accountID)) {
					usersList.push(`${user.accountID}:${user.userName}:${user.accountID}`);
				}
				const roleAssign = await RoleAssignModel.findOne({ accountID: comment.accountID });

				let userRole;
				if (roleAssign) {
					userRole = await RoleModel.findOne({ roleID: roleAssign.roleID });
				}

				let prefix;
				let badgeLevel;
				let commentColor;

				if (userRole) {
					prefix = userRole.prefix + ' - ';
					badgeLevel = await GJHelpers.getAccountPermission(comment.accountID, EPermissions.badgeLevel);
					commentColor = userRole.commentColor;
				}

				let dateAgo = moment(comment.uploadDate * 1000).fromNow(true);

				// робтоп когда json
				commentsList.push(`2~${comment.comment}~3~${comment.accountID}~4~${comment.likes}~5~0~7~${+comment.isSpam}~9~${prefix || ''}${dateAgo}~6~${comment.commentID}~10~${comment.percent}`
					+
					`~11~${badgeLevel || 0}~12~${commentColor || 0}:1~${user.userName}~7~1~9~${user.icon}~10~${user.color1}~11~${user.color2}~14~${user.iconType}~15~${user.special}~16~${user.accountID}`);
			};
			fc.success(`Комментарии уровня ${levelID} получены`);

			const result = `${commentsList.join('|')}#${usersList.join('|')}#${commentsCount}:${page}:10`
			return res.send(result);
		}
	});

	app.all(`/${config.basePath}/getGJCommentHistory`, async (req: any, res: any) => {
		const requredKeys = ['page', 'userID'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const accountID = body.userID;
		const page = body.page;
		const mode = body.mode || 0;

		let orderBy: any = { commentID: 1 };
		if (mode == 1) orderBy = { likes: 1 };

		let commentsList = [];
		let usersList = [];

		let users: number[] = [];

		const comments = await CommentModel.find({ accountID: accountID }).sort(orderBy).skip(page * 10).limit(10);
		const commentsCount = await CommentModel.countDocuments({ accountID: accountID });

		if (!comments || !commentsCount) {
			fc.error(`Комментарии аккаунта ${accountID} не получены: комментарии не найдены`);
			return res.send('-2')
		} else {
			const user = await UserModel.findOne({ accountID: accountID });
			const users = `${user.accountID}:${user.userName}:${user.accountID}`;

			for (const comment of comments) {
				const roleAssign = await RoleAssignModel.findOne({ accountID: comment.accountID });

				let userRole;
				if (roleAssign) {
					userRole = await RoleModel.findOne({ roleID: roleAssign.roleID });
				}

				let prefix;
				let badgeLevel;
				let commentColor;

				if (userRole) {
					prefix = userRole.prefix + ' - ';
					badgeLevel = await GJHelpers.getAccountPermission(comment.accountID, EPermissions.badgeLevel);
					commentColor = userRole.commentColor;
				}

				let dateAgo = moment(comment.uploadDate * 1000).fromNow(true);

				// робтоп когда json

				commentsList.push(`2~${comment.comment}~3~${comment.accountID}~4~${comment.likes}~5~0~7~${+comment.isSpam}~9~${prefix || ''}${dateAgo}~6~${comment.commentID}~10~${comment.percent}`
					+
					`~11~${badgeLevel || 0}~12~${commentColor || 0}:1~${user.userName}~7~1~9~${user.icon}~10~${user.color1}~11~${user.color2}~14~${user.iconType}~15~${user.special}~16~${user.accountID}`);
			};
			fc.success(`Комментарии аккаунта ${accountID} получены`);

			const result = `${commentsList.join('|')}#${users}#${commentsCount}:${page}:10`
			return res.send(result);
		}
	});
}

export { routes }