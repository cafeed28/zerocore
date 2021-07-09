// app.all(`/${config.basePath}/requestUserAccess`, async (req: any, res: any) => {
// 	const requredKeys = ['accountID', 'gjp', 'secret']
// 	const body = req.body
// 	if (!WebHelper.checkRequired(body, requredKeys, res)) return

// 	const accountID = body.accountID
// 	const gjp = body.gjp
// 	if (await GJCrypto.gjpCheck(gjp, accountID)) {
// 		if (await GJHelpers.getAccountPermission(accountID, EPermissions.badgeLevel) > 0) {
// 			const permission = await GJHelpers.getAccountPermission(accountID, EPermissions.badgeLevel)

// 			fc.success(`Доступ модератора аккаунта ${accountID} уровня ${permission} получен`)
// 			return res.send(permission.toString())
// 		}
// 		else {
// 			fc.error(`Доступ модератора аккаунта ${accountID} не получен: доступ запрещен`)
// 			return res.send('-1')
// 		}
// 	}
// 	else {
// 		fc.error(`Доступ модератора аккаунта ${accountID} не получен: ошибка авторизации`)
// 		return res.send('-1')
// 	}
// })