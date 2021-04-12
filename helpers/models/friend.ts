import mongoose, { Schema, Document } from "mongoose";

export interface IFriend extends Document {
	ID: number,
	accountID1: number,
	accountID2: number,
	isUnread1: { type: number, default: 1 },
	isUnread2: { type: number, default: 1 }
}

const FriendSchema: Schema = new Schema({
	ID: Number,
	accountID1: Number,
	accountID2: Number,
	isUnread1: { type: Number, default: 1 },
	isUnread2: { type: Number, default: 1 }
});

export default mongoose.model<IFriend>('friends', FriendSchema);