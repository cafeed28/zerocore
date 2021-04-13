import mongoose, { Schema, Document } from "mongoose";

export interface IFriend {
	ID: number,
	accountID1: number,
	accountID2: number,
	isUnread1?: number,
	isUnread2?: number
}

interface IFriendModel extends IFriend, Document { }

const FriendSchema: Schema = new Schema({
	ID: Number,
	accountID1: Number,
	accountID2: Number,
	isUnread1: { type: Number, default: 1 },
	isUnread2: { type: Number, default: 1 }
});

export const FriendModel = mongoose.model<IFriendModel>('friends', FriendSchema);