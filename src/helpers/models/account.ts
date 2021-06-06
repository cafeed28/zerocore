import mongoose, { Schema, Document } from "mongoose";

export interface IAccount {
	accountID: number,
	userName: string,
	password: string,
	email: string
}

interface IAccountModel extends IAccount, Document { }

const AccountSchema: Schema = new Schema({
	accountID: Number,
	userName: String,
	password: String,
	email: String
});

export const AccountModel = mongoose.model<IAccountModel>('accounts', AccountSchema);