import mongoose, { Schema, Document } from "mongoose";

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
});

export const RoleAssignModel = mongoose.model<IRoleAssignModel>('roleAssigns', RoleAssignSchema);