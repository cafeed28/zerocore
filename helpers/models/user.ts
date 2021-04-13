import mongoose, { Schema, Document } from "mongoose";

export interface IUser {
	userName: string,
	accountID: number,
	coins: number,
	userCoins: number,
	stars: number,
	diamonds: number,
	orbs: number,
	special: number,
	demons: number,
	creatorPoints: number,
	completedLevels: number,

	chest1Time: number,
	chest2Time: number,
	chest1Count: number,
	chest2Count: number,

	color1: number,
	color2: number,
	icon: number,
	iconType: number,

	accIcon: number,
	accShip: number,
	accBall: number,
	accBird: number,
	accDart: number,
	accRobot: number,
	accSpider: number,
	accGlow: number,
	accExplosion: number,

	mS: number,
	frS: number,
	cS: number,
	youtube: string,
	twitter: string,
	twitch: string, // поменяю на discord когда выйдет blackTea от партура

	IP: string,
	lastPlayed: number,
	isBanned: boolean
}

interface IUserModel extends IUser, Document { }

const UserSchema: Schema = new Schema({
	userName: String,
	accountID: Number,
	coins: Number,
	userCoins: Number,
	stars: Number,
	diamonds: Number,
	orbs: Number,
	special: Number,
	demons: Number,
	creatorPoints: { type: Number, default: 0 },
	completedLevels: { type: Number, default: 0 },

	chest1Time: Number,
	chest2Time: Number,
	chest1Count: Number,
	chest2Count: Number,

	color1: Number,
	color2: Number,
	icon: Number,
	iconType: Number,

	accIcon: Number,
	accShip: Number,
	accBall: Number,
	accBird: Number,
	accDart: Number,
	accRobot: Number,
	accSpider: Number,
	accGlow: Number,
	accExplosion: Number,

	mS: { type: Number, default: 0 },
	frS: { type: Number, default: 0 },
	cS: { type: Number, default: 0 },
	youtube: { type: String, default: '' },
	twitter: { type: String, default: '' },
	twitch: { type: String, default: '' }, // поменяю на discord когда выйдет blackTea от партура

	IP: String,
	lastPlayed: Number,
	isBanned: Boolean
});

export const UserModel = mongoose.model<IUserModel>('users', UserSchema);