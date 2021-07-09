import mongoose, { Schema, Document } from 'mongoose'
import AutoIncrementFactory from 'mongoose-sequence'

export interface IRole {
	roleName: string,
	roleID: number,

	freeCopy: boolean,
	rateLevelDiff: boolean,
	rateLevelStar: boolean,
	sendLevelRate: boolean,
	setDailyWeeklyLevel: boolean,

	moveLevelAcc: boolean,
	changeLevelDesc: boolean,

	badgeLevel: number,
	requestMod: boolean,

	commentColor: string,
	prefix: string
}

interface IRoleModel extends IRole, Document { }

const RoleSchema: Schema = new Schema({
	roleName: String,
	roleID: Number,

	freeCopy: { type: Boolean, default: false },
	rateLevelDiff: { type: Boolean, default: false },
	rateLevelStar: { type: Boolean, default: false },
	sendLevelRate: { type: Boolean, default: false },

	moveLevelAcc: { type: Boolean, default: false },
	changeLevelDesc: { type: Boolean, default: false },

	badgeLevel: { type: Number, default: 0 },
	requestMod: { type: Boolean, default: false },

	commentColor: { type: String, default: '255,255,255' },
	prefix: { type: String, default: '' }
})

RoleSchema.plugin(AutoIncrementFactory(mongoose), { inc_field: 'roleID' })

export const RoleModel = mongoose.model<IRoleModel>('roles', RoleSchema)