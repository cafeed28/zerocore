import mongoose, { Schema, Document } from 'mongoose'
import AutoIncrementFactory from 'mongoose-sequence'

export interface ILevel {
	accountID: number,
	levelID: number,
	levelName: string,
	levelLength: number,
	levelVersion: number,
	levelDesc: string,
	extraString: string,

	audioTrack: number,
	auto: number,
	password: number,
	original: number,
	twoPlayer: number,
	songID?: number,
	objects: number,
	coins: number,
	requestedStars: number,
	unlisted: boolean,
	ldm: number,

	starStars: number,
	starCoins: boolean,
	starDifficulty: number,
	starDemon: boolean,
	starFeatured: boolean,
	starAuto: boolean,
	starEpic: boolean,
	starDemonDiff: number,
	downloads: number,
	likes: number,

	uploadDate: number,
	updateDate: number,
	isReuploaded: boolean,

	IP: string
}

interface ILevelModel extends ILevel, Document { }

const LevelSchema: Schema = new Schema({
	accountID: Number,
	levelID: { type: Number, unique: true },
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
	requestedStars: Number,
	unlisted: Number,
	ldm: Number,

	starStars: { type: Number, default: 0 },
	starCoins: { type: Boolean, default: false },
	starDifficulty: { type: Number, default: 0 },
	starDemon: { type: Boolean, default: false },
	starFeatured: { type: Boolean, default: false },
	starAuto: { type: Boolean, default: false },
	starEpic: { type: Boolean, default: false },
	starDemonDiff: { type: Number, default: 0 },
	downloads: { type: Number, default: 0 },
	likes: { type: Number, default: 0 },

	uploadDate: { type: Number, default: 0 },
	updateDate: { type: Number, default: 0 },
	isReuploaded: { type: Boolean, default: false },

	IP: String
})

LevelSchema.plugin(AutoIncrementFactory(mongoose), { inc_field: 'levelID' })

export const LevelModel = mongoose.model<ILevelModel>('levels', LevelSchema)