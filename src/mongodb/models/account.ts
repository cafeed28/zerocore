import mongoose, { Schema, Document } from 'mongoose'
import AutoIncrementFactory from 'mongoose-sequence'

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
})

AccountSchema.plugin(AutoIncrementFactory(mongoose), { inc_field: 'accountID' })

export const AccountModel = mongoose.model<IAccountModel>('accounts', AccountSchema)