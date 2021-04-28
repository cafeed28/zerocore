import express from 'express';
const app = express.Router();

app.all(`/`, async (req: any, res: any) => {
	return res.send('well cum')
});

export { app as router };