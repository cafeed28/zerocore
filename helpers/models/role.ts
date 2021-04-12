import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
	roleName: string,
	roleID: Number,

	freeCopy: { type: number, default: 0 },
	rateLevelDiff: { type: number, default: 0 },
	rateLevelStar: { type: number, default: 0 },
	sendLevelRate: { type: number, default: 0 },

	moveLevelAcc: { type: number, default: 0 },
	changeLevelDesc: { type: number, default: 0 },

	badgeLevel: { type: number, default: 0 },
	requestMod: { type: number, default: 0 },

	commentColor: { type: string, default: '255,255,255' },
	prefix: { type: string, default: '' }
}

const RoleSchema: Schema = new Schema({
	roleName: String,
	roleID: Number,

	freeCopy: { type: Number, default: 0 },
	rateLevelDiff: { type: Number, default: 0 },
	rateLevelStar: { type: Number, default: 0 },
	sendLevelRate: { type: Number, default: 0 },

	moveLevelAcc: { type: Number, default: 0 },
	changeLevelDesc: { type: Number, default: 0 },

	badgeLevel: { type: Number, default: 0 },
	requestMod: { type: Number, default: 0 },

	commentColor: { type: String, default: '255,255,255' },
	prefix: { type: String, default: '' }
});

export default mongoose.model<IRole>('roles', RoleSchema);