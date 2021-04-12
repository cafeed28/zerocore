import mongoose, { Schema, Document } from "mongoose";

export interface IRoleAssign extends Document {
	assignID: number,
	accountID: number,
	roleID: number
}

const RoleAssignSchema: Schema = new Schema({
	assignID: Number,
	accountID: Number,
	roleID: Number
});

export default mongoose.model<IRoleAssign>('roleAssigns', RoleAssignSchema);