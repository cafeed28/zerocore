import mongoose, { Schema, Document } from 'mongoose'
import AutoIncrementFactory from 'mongoose-sequence'

export interface IRoleAssign {
	assignID: number,
	accountID: number,
	roleID: number
}

interface IRoleAssignModel extends IRoleAssign, Document { }

const RoleAssignSchema: Schema = new Schema({
	roleID: { type: Number, unique: false },
	assignID: { type: Number, unique: true },
	accountID: Number
})

RoleAssignSchema.plugin(AutoIncrementFactory(mongoose), { inc_field: 'assignID' })

export const RoleAssignModel = mongoose.model<IRoleAssignModel>('roleassigns', RoleAssignSchema)