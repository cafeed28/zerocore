async function router(router: any, options: any) {
	router.all(`/`, async (req: any, res: any) => {
		return 'well cum';
	});
}

export { router };