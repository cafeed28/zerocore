import mongoose, { Schema, Document } from "mongoose";

export interface IAccount {
	accountID: number,
	userName: string,
	password: string,
	email: string,
	secret: string
}

interface IAccountModel extends IAccount, Document { }

const AccountSchema: Schema = new Schema({
	accountID: Number,
	userName: String,
	password: String,
	email: String,
	secret: String
});

export const AccountModel = mongoose.model<IAccountModel>('accounts', AccountSchema);