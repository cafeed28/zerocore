import mongoose, { Schema, Document } from 'mongoose'
import AutoIncrementFactory from 'mongoose-sequence'

export interface IFriend {
	ID: number,
	accountID1: number,
	accountID2: number,
	isUnread1: boolean,
	isUnread2: boolean
}

interface IFriendModel extends IFriend, Document { }

const FriendSchema: Schema = new Schema({
	ID: { type: Number, unique: true },
	accountID1: Number,
	accountID2: Number,
	isUnread1: { type: Boolean, default: true },
	isUnread2: { type: Boolean, default: true }
})

FriendSchema.plugin(AutoIncrementFactory(mongoose), { inc_field: 'ID' })

export const FriendModel = mongoose.model<IFriendModel>('friends', FriendSchema)