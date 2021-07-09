import mongoose, { Schema, Document } from 'mongoose'
import AutoIncrementFactory from 'mongoose-sequence'

export interface IRoleAssign {
	assignID: number,
	accountID: number,
	roleID: number
}

interface IRoleAssignModel extends IRoleAssign, Document { }

const RoleAssignSchema: Schema = new Schema({
	assignID: Number,
	accountID: Number,
	roleID: Number
})

RoleAssignSchema.plugin(AutoIncrementFactory(mongoose), { inc_field: 'assignID' })

export const RoleAssignModel = mongoose.model<IRoleAssignModel>('roleassigns', RoleAssignSchema)