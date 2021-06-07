import mongoose, { Schema, Document } from "mongoose"

export interface IFriend {
	ID: number,
	accountID1: number,
	accountID2: number,
	isUnread1?: boolean,
	isUnread2?: boolean
}

interface IFriendModel extends IFriend, Document { }

const FriendSchema: Schema = new Schema({
	ID: Number,
	accountID1: Number,
	accountID2: Number,
	isUnread1: { type: Boolean, default: true },
	isUnread2: { type: Boolean, default: true }
})

export const FriendModel = mongoose.model<IFriendModel>('friends', FriendSchema)