import mongoose, { Schema, Document } from 'mongoose'
import AutoIncrementFactory from 'mongoose-sequence'
import log from '../../logger'
import bcrypt from 'bcrypt'

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

AccountSchema.plugin(AutoIncrementFactory(mongoose), { inc_field: 'accountID' })

export const AccountModel = mongoose.model<IAccountModel>('accounts', AccountSchema)

export async function createAccount(userName: string, password: string, email: string) {
	try {
		await AccountModel.create({
			userName, email,
			password: await bcrypt.hash(password, 10)
		})
		return { code: 0 }
	}
	catch (err) {
		log.debug(err)
		if (err.name == 'MongoError' && err.code == 11000) {
			return { code: 2 }
		}
		return { code: 1 }
	}
}