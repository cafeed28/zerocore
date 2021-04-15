import mongoose, { Schema, Document } from "mongoose";

export interface ILevel {
	accountID: number,
	levelID: number,
	levelName: string,
	levelLength: number,
	levelVersion?: number,
	levelDesc?: string,
	extraString: string,

	audioTrack: number,
	auto: number,
	password: number,
	original: number,
	twoPlayer: number,
	songID: number,
	objects: number,
	coins: number,
	starCoins: number,
	requestedStars: number,
	unlisted: number,
	ldm: number,

	starDifficulty?: number,
	starDemon?: number,
	starStars?: number,
	starFeatured?: number,
	starAuto?: number,
	starEpic?: number,
	starDemonDiff?: number,
	downloads?: number,
	likes?: number,

	IP: string
}

interface ILevelModel extends ILevel, Document { }

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

export const LevelModel = mongoose.model<ILevelModel>('levels', LevelSchema);