import mongoose, { Schema, Document } from "mongoose";

export interface IAccount extends Document {
	accountID: number,
	userName: string,
	password: string,
	email: string,
	secret: string
}

const AccountSchema: Schema = new Schema({
	accountID: Number,
	userName: String,
	password: String,
	email: String,
	secret: String
});

export default mongoose.model<IAccount>('accounts', AccountSchema);