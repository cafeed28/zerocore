import tinyhttp from '@opengalaxium/tinyhttp'

function routes(app: tinyhttp) {
	app.all(`/`, async (req: any, res: any) => {
		return res.send('well cum')
	})
}

export { routes }