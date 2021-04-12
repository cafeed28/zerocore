import mongoose, { Schema, Document } from "mongoose";

export interface ILevel extends Document {
	accountID: number,
	levelID: number,
	levelName: string,
	levelLength: { type: number, default: 0 },
	levelVersion: { type: number, default: 0 },
	levelDesc: { type: string, default: '' },
	extraString: string,

	audioTrack: number,
	auto: number,
	password: number,
	original: number,
	twoPlayer: number,
	songID: { type: number, default: 0 },
	objects: number,
	coins: number,
	starCoins: { type: number, default: 0 },
	requestedStars: number,
	unlisted: number,
	ldm: number,

	starDifficulty: { type: number, default: 0 },
	starDemon: { type: number, default: 0 },
	starStars: { type: number, default: 0 },
	starFeatured: { type: number, default: 0 },
	starAuto: { type: number, default: 0 },
	starEpic: { type: number, default: 0 },
	starDemonDiff: { type: number, default: 0 },
	downloads: { type: number, default: 0 },
	likes: { type: number, default: 0 },

	IP: string
}

const LevelSchema: Schema = new Schema({
	accountID: Number,
	levelID: Number,
	levelName: String,
	levelLength: { type: Number, default: 0 },
	levelVersion: { type: Number, default: 0 },
	levelDesc: { type: String, default: '' },
	extraString: String,

	audioTrack: Number,
	auto: Number,
	password: Number,
	original: Number,
	twoPlayer: Number,
	songID: { type: Number, default: 0 },
	objects: Number,
	coins: Number,
	starCoins: { type: Number, default: 0 },
	requestedStars: Number,
	unlisted: Number,
	ldm: Number,

	starDifficulty: { type: Number, default: 0 },
	starDemon: { type: Number, default: 0 },
	starStars: { type: Number, default: 0 },
	starFeatured: { type: Number, default: 0 },
	starAuto: { type: Number, default: 0 },
	starEpic: { type: Number, default: 0 },
	starDemonDiff: { type: Number, default: 0 },
	downloads: { type: Number, default: 0 },
	likes: { type: Number, default: 0 },

	IP: String
});

export default mongoose.model<ILevel>('levels', LevelSchema);