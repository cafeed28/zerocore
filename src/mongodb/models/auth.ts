import mongoose, { Schema, Document } from 'mongoose'

export interface IAuth {
    accountID: number,
    token: string
}

interface IAuthModel extends IAuth, Document { }

const AuthSchema: Schema = new Schema({
    accountID: Number,
    token: { type: String, unique: true }
})

export const AuthModel = mongoose.model<IAuthModel>('auth', AuthSchema)