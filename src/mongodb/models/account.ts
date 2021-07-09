import mongoose, { Schema, Document } from 'mongoose'
import AutoIncrementFactory from 'mongoose-sequence'

export interface IAccount {
	accountID: number,
	userName: string,
	password: string,
	email: string,
	isBanned: boolean
}

interface IAccountModel extends IAccount, Document { }

const AccountSchema: Schema = new Schema({
	accountID: { type: Number, unique: true },
	userName: { type: String, unique: true },
	password: String,
	email: { type: String, unique: true, required: true },
	isBanned: { type: Boolean, default: false }
})

AccountSchema.plugin(AutoIncrementFactory(AccountModel), { inc_field: 'accountID' })

export const AccountModel = mongoose.model<IAccountModel>('accounts', AccountSchema)