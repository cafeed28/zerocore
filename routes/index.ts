import express from 'express';

const router = express.Router();

router.all(`/`, async (req, res) => {
	return res.send('well cum');
});

export { router };