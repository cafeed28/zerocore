import mongoose, { Schema, Document } from "mongoose";

export interface IAuth {
    accountID: number,
    token: string,
    expiresAt: number
}

interface IAuthModel extends IAuth, Document { }

const AuthSchema: Schema = new Schema({
    accountID: Number,
    token: String,
    expiresAt: Number
});

export const AuthModel = mongoose.model<IAuthModel>('auth', AuthSchema);