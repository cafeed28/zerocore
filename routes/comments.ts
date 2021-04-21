import fc from 'fancy-console';
import config from '../config';

import moment from 'moment';

import WebHelper from '../helpers/classes/WebHelper';
import GJCrypto from '../helpers/classes/GJCrypto';

import { CommentModel, IComment } from '../helpers/models/comment';
import { IUser, UserModel } from '../helpers/models/user';
import { RoleModel } from '../helpers/models/role';
import { RoleAssignModel } from '../helpers/models/roleAssign';

async function router(router: any, options: any) {
	router.post(`/${config.basePath}/uploadGJComment21.php`, async (req: any, res: any) => {
		const requredKeys = ['gjp', 'userName', 'accountID', 'levelID', 'comment', 'secret'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const gjp = body.gjp;
		const userName = body.userName;
		const accountID = body.accountID;
		const levelID = body.levelID;
		const commentStr = body.comment;
		const percent = body.percent || 0;

		if (GJCrypto.gjpCheck(gjp, levelID)) {
			const comment: IComment = {
				userName: userName,
				comment: commentStr,
				levelID: levelID,
				accountID: accountID,
				percent: percent,
				uploadDate: Date.now(),
				commentID: (await CommentModel.countDocuments()) + 1,
				likes: 0,
				isSpam: 0
			};
			CommentModel.create(comment);

			fc.success(`Комментарий на уровне ${levelID} создан`);
			return '1';
		} else {
			fc.error(`Комментарий на уровне ${levelID} не создан: ошибка авторизации`);
			return '-1';
		}
	});

	router.post(`/${config.basePath}/deleteGJComment20.php`, async (req: any, res: any) => {
		const requredKeys = ['gjp', 'commentID', 'levelID', 'accountID', 'secret'];
		const body = req.body;
		if (!WebHelper.checkRequired(body, requredKeys, res)) return;

		const gjp = body.gjp;
		const levelID = body.levelID;
		const accountID = body.accountID;
		const commentID = body.commentID;

		if (GJCrypto.gjpCheck(gjp, accountID)) {
			const comment = await CommentModel.deleteOne({
				commentID: commentID
			});

			if (comment.deletedCount == 0) {
				fc.error(`Комментарий с уровня ${levelID} не удален: пост не найден`);
				return '-1';
			} else {
				fc.success(`Комментарий с уровня ${levelID} удален`);
				return '1';
			}

		} else {
			fc.error(`Комментарий с уровня ${levelID} не удален: ошибка авторизации`);
			return '-1';
		}
	});

	router.post(`/${config.basePath}/getGJComments21.php`, async (req: any, res: any) => {
		const requredKeys = ['levelID', 'page'];
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
			return '-1';
		} else {
			for (const comment of comments) {
				const user = await UserModel.findOne({ accountID: comment.accountID });
				if (!users.includes(user.accountID)) {
					usersList.push(`${user.accountID}:${user.userName}:${user.accountID}`);
				}

				const roleAssign = await RoleAssignModel.findOne({ accountID: comment.accountID });
				const userRole = await RoleModel.findOne({ roleID: roleAssign.roleID });

				if (userRole) {
					var prefix: any = userRole.prefix + ' - ';
					var badgeLevel = userRole.badgeLevel;
					var commentColor = userRole.commentColor;
				}

				let dateAgo = moment(comment.uploadDate).fromNow(true);

				// надеюсь, в 2.2 будет json...
				// робтоп, если ты это читаешь (ага конечно), знай, ты пидо рас блять где json ну нахуя этот формат ёбнутый

				commentsList.push(`2~${comment.comment}~3~${comment.accountID}~4~${comment.likes}~5~0~7~${comment.isSpam}~9~${prefix || ''}${dateAgo}~6~${comment.commentID}~10~${comment.percent}`
					+
					`~11~${badgeLevel || 0}~12~${commentColor || 0}:1~${user.userName}~7~1~9~${user.icon}~10~${user.color1}~11~${user.color2}~14~${user.iconType}~15~${user.special}~16~${user.accountID}`);
			};
			fc.success(`Комментарии уровня ${levelID} получены`);

			const result = `${commentsList.join('|')}#${usersList.join('|')}#${commentsCount}:${page}:10`
			fc.log(result);

			return result;
		}
	});
}

export { router };